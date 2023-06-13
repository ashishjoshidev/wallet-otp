import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Input,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { AddIcon } from '@chakra-ui/icons';

function AddSecret({ saveSecret }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = data => {
    onClose();
    saveSecret(data);
    reset();
  };

  return (
    <>
      <Button onClick={onOpen}>
        <AddIcon marginRight={2} /> Add Secret
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add secret</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <Input
                type="text"
                placeholder="Service"
                {...register('Service', { required: true, maxLength: 80 })}
                marginBottom={2}
              />
              <Input
                type="text"
                placeholder="Account"
                {...register('Account', {
                  required: true,
                  max: 100,
                  maxLength: 100,
                })}
                marginBottom={2}
              />
              <Input
                type="text"
                placeholder="Secret key"
                {...register('Secret', {
                  required: true,
                  minLength: 32,
                  maxLength: 80,
                })}
              />
            </ModalBody>

            <ModalFooter>
              <Button
                background="#FF0080"
                mr={3}
                onClick={handleSubmit(onSubmit)}
              >
                Save
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}

export default AddSecret;
