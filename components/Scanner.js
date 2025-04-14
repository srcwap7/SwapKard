import { CameraView,useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Camera } from 'lucide-react-native';
import { useSelector } from 'react-redux';

export default function QRScanner({socket}) {
  const [facing, setFacing] = useState('back');
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const userObject = useSelector((state) => state.user);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission required</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleBarCodeScanned = ({ type, data }) => {
    console.log(data);
    data = JSON.parse(data);
    const QRType = data.type;
    console.log(data,QRType);  
    if (QRType === 1){
      socket.emit('sendRequest',{senderId:userObject.user.id,receiverId:data.id});
      console.log("Request sent to id",data.id);
    }
    else if (QRType === 0){
      socket.emit('skipRequest',{senderId:userObject.user.id,receiverData:data});  
      console.log("Skip Request sent to id",data.id);
    }
    setIsScanning(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan And Connect</Text>
      {!isScanning ? (
        <TouchableOpacity 
          style={styles.scanButton} 
          onPress={() => setIsScanning(true)}
        >
          <Camera size={50} color="#fff" />
          <Text style={styles.scanButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
      ) : (
        <CameraView
          style={styles.camera}
          facing={facing}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417', 'aztec']
          }}
          onBarcodeScanned={handleBarCodeScanned}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={toggleCameraFacing}
            >
              <Text style={styles.buttonText}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={() => setIsScanning(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    width: '100%',
  },
  permissionText: {
    color: '#fff',
    marginBottom: 20,
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 10,
  },
  scanButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  cameraButton: {
    backgroundColor: 'rgba(26,26,26,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  }
});