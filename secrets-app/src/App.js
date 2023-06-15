import { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  extendTheme,
  Text,
  Container,
  HStack,
  Button,
} from '@chakra-ui/react';

import { useAccount, useDisconnect } from 'wagmi';
import { getAccount } from '@wagmi/core';
import { Polybase } from '@polybase/client';
import * as eth from '@polybase/eth';

import ServiceCard from './components/ServiceCard';
import AddSecret from './components/AddSecret';
import LoaderModal from './components/LoaderModal';
import './App.css';
import LandingPage from './pages/LandingPage';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

function App() {
  const { address, isConnected } = useAccount();
  const account = getAccount();
  const { disconnect } = useDisconnect();
  const [polybaseLoading, setPolybaseLoading] = useState(false);
  const [polybaseRetrying, setPolybaseRetrying] = useState(false);
  // todo: add signed in with ENS ui

  // check if wallet is part of data dao

  // if it's part of data dao get mapping of wallet address -> encrypted collection on Polybase

  // these secrets are currently hardcoded but will come from Polybase or some encrypted db
  // todo: decrypt secret then display cards
  const [polybaseDb, setPolygbaseDb] = useState();
  const [collectionReference, setCollectionReference] = useState();
  const [collectionData, setCollectionData] = useState([]);
  const [addedSigner, setAddedSigner] = useState(false);
  const [cards, setCards] = useState([
    // these are fake accounts and fake secrets
    {
      name: 'Google: test@google.com',
      secret: 'j22h ni4e cd4o hqrx fka7 7uye wf2d xh77',
    },
    {
      name: 'Instagram: @steph.test',
      secret: 'tcwb oqj3 f3p3 5lca iarf dpqv rhc6 5iwt',
    },
  ]);

  const listRecords = async () => {
    const records = await polybaseDb.collection(collectionReference).get();
    return records;
  };

  const deleteRecord = async id => {
    const record = await polybaseDb
      .collection(collectionReference)
      .record(id)
      .call('del');
    return record;
  };

  const listRecordsWhere = async (field, op, val) => {
    const records = await polybaseDb
      .collection(collectionReference)
      .where(field, op, val)
      .get();
    return records;
  };

  const createRecord = async (id, message) => {
    console.log('createRecord');
    setPolybaseLoading(true);
    // .create(args) args array is defined by the constructor fn
    try {
      const records = await polybaseDb
        .collection(collectionReference)
        .create([id, message]);

      console.log('success!');
      setPolybaseRetrying(false);
    } catch (err) {
      console.log(err);

      // -32603 is the error code if user cancels tx
      if (err.code !== -32603) {
        createRecord(id, message);
        setPolybaseRetrying(true);
      }
    }
    setPolybaseLoading(false);
  };

  const encryptAndSaveSecret = secretData => {
    // todo: encrypt and post to Polybase
    console.log(secretData);

    const name = `${secretData.Service}: ${secretData.Account}`;
    setCards(cards => [
      {
        name,
        secret: secretData.Secret,
      },
      ...cards,
    ]);
  };

  useEffect(() => {
    if (isConnected) {
      const db = new Polybase({
        // https://explorer.testnet.polybase.xyz/studio/pk%2F0x0a4f8fcf98d7e5745ed5911b7c6f864e92a0016539d9ed46221d1e378ceb1e2498fc2390ee81ab65fd6a6e9255d334bcbed14f25db92faf2c7c4e785181675dc%2Fugh/collections/User
        defaultNamespace:
          'pk/0x0a4f8fcf98d7e5745ed5911b7c6f864e92a0016539d9ed46221d1e378ceb1e2498fc2390ee81ab65fd6a6e9255d334bcbed14f25db92faf2c7c4e785181675dc/ugh',
      });

      console.log(account);

      const addSigner = async () => {
        db.signer(async data => {
          const accounts = await eth.requestAccounts();
          const account = accounts[0];
          const sig = await eth.sign(data, account);
          setAddedSigner(true);
          return { h: 'eth-personal-sign', sig };
        });
      };

      // Add signer fn
      addSigner()
        .then(() => {
          console.log(db);
        })
        .then(() => {
          setPolygbaseDb(db);
          console.log('setPolygbaseDb');
        })
        .then(() => {
          setCollectionReference('User');
        });
    }
  }, [isConnected]);

  return (
    <ChakraProvider theme={extendTheme({ config })}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <VStack spacing={8}>
            <LoaderModal
              open={polybaseLoading || polybaseRetrying}
              message={
                polybaseLoading
                  ? 'Sign the message in your wallet to encrypt and save'
                  : 'Still polling Polybase, please sign again.'
              }
            />
            <Container>
              {isConnected && address && (
                <HStack justifyContent={'space-between'}>
                  <Text
                    bgGradient="linear(to-l, #7928CA, #FF0080)"
                    bgClip="text"
                    fontSize="4xl"
                    fontWeight="bold"
                  >
                    My OTPs
                  </Text>
                  <div>
                    <Button
                      onClick={() => {
                        createRecord(`steph ${new Date().toString()}`, address);
                      }}
                    >
                      add rec
                    </Button>
                    <Button
                      onClick={() => {
                        const firstRec = deleteRecord('abc');
                        console.log(firstRec);
                      }}
                    >
                      delete rec
                    </Button>
                    <AddSecret saveSecret={encryptAndSaveSecret} />
                    <Button marginLeft={2} onClick={() => disconnect()}>
                      Log out
                    </Button>
                  </div>
                </HStack>
              )}
              {!isConnected && <LandingPage />}
              {cards.map(c => (
                <ServiceCard key={c.name} name={c.name} secret={c.secret} />
              ))}
            </Container>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
