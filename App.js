import React, {useState} from 'react';
import {View, Text, StatusBar, StyleSheet, TouchableOpacity, Modal, Image, PermissionsAndroid, Platform, ImagePickerIOS} from 'react-native';
import {RNCamera} from 'react-native-camera';
import CameraRoll from '@react-native-community/cameraroll';
import * as ImagePicker from 'react-native-image-picker';

// Para tirar a StatusBar da tela! 

export default function App(){

  // criado um useState para atriburi a camera ao estado! 
  const [type, setType] = useState(RNCamera.Constants.Type.back)
  const [open, setOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  async function takePicture(camera){  // recebendo camera !
     const options = {quality: 0.5, base64: true }; //configurar a qualidade da foto.
     const data = await camera.takePictureAsync(options); // tira a foto e dentro do data tem o retorno.


     setCapturedPhoto(data.uri); 
     setOpen(true);       //para abrir o Modal!
     console.log('Foto' + data.uri);

      // chama funcao salvar a foto no album
      savePicture(data.uri);

  }

         // funcao de permissao e checagem! 
   async function hasAndroidPermission(){ 
     const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
         // passando a permissao que quer checar!
     const hasPermission = await PermissionsAndroid.check(permission);
     
     if (hasPermission){
       return true;
     } 
      const status = await PermissionsAndroid.request(permission);
      return status === 'granted';
    }

    async function savePicture(data){
        if(Platform.OS === 'android' && !(await hasAndroidPermission())){
            return;
        }

        CameraRoll.save(data, 'photo')
        .then((res) => {
            console.log('Salvo com sucesso ' + res)
        })
        .catch((err) => {
          console.log('Error ao salvar ' + err)
        })
    }

  function toggleCam(){  // mudando a camrera para front e back. funcao chamada no botao trocar!
    setType(type === RNCamera.Constants.Type.back ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back);
  }

  // funcao para abrir o album!
  function openAlbum(){
    const options = {
      title: 'Selecione uma foto',
      chooseFromLibaryButtonTitle: 'Buscar foto do album...',
      noData: true,
      mediaType: 'photo'
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if(response.didCancel){
        console.log('Imagem Picker cancelado...');
      }else if(response.error){
        console.log('Gerou algum erro: ' + response.error);
      }else{
        setCapturedPhoto(response.uri);
        setOpen(true);
      }
    });
  }

  return(
    <View style={styles.container}>                
      <StatusBar hidden={true}/>  
      
      <RNCamera 
        style={styles.preview}
        type={type} //  a camera esta atribuida com useState!
        flashMode={RNCamera.Constants.FlashMode.auto} // vai usar o flash automatico.
        androidCameraPermissionOptions={{
          title: 'Permissao para usar camera!',
          message: 'Para prosseguir com a camera aceite a permissao',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancelar'
        }}      
      >

      {({ camera, status, recordAndroidPermissionStatus}) => {
        if(status !== 'READY') return <View/>;
        return(
          <View 
          style={{marginBottom: 35, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between'}}  // passando estilos na mesma linha!
          >
            <TouchableOpacity 
              onPress={()=> takePicture(camera)}  // passando a funcao p/ abir o Modal, e mandando camera para a funcao takePicture!
              style={styles.capture}
            >
              <Text>Tirar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={openAlbum}
              style={styles.capture}
            >
              <Text>Album</Text>
            </TouchableOpacity>

          </View>
        );
        }
      }                        
      
       </RNCamera>
      
        <View style={styles.camPosition}>  
          <TouchableOpacity onPress={toggleCam}>   
            <Text>Trocar</Text>
          </TouchableOpacity>
        </View>

        { capturedPhoto &&    // se capturedPhoto for verdadeiro ele abre o Modal.
          <Modal animationType= 'slide' transparent={false} visible={open}>
            <View style={{flex:1, justifyContent: 'center', alignItems: 'center', margin: 20 }}>
              <TouchableOpacity 
               style={{margin:10}}
               onPress={() => setOpen(false)} // ao clicar nesse botao vai fechar o modal!
              >
                <Text style={{ fontSize: 22 }}>Fechar</Text>
              </TouchableOpacity> 

              <Image  
                resizeMode='contain' // para não cortar a lateral da foto, vai encaixar no tamanho atribuido! 
                style={{ width: 350, height:450, borderRadius: 15}}
                source={{ uri: capturedPhoto}} // passa o caminho da imagem onde vai ser exibida!
              />

            </View>
          </Modal>
        }
       

    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent: 'center'
  },
  preview:{
    flex:1,
    justifyContent:'flex-end',
    alignItems: 'center'
  },
  capture:{
    flex:0,
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  camPosition:{
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 10,
    height: 40,
    position: 'absolute',
    right: 25,
    top: 60,
  }
});