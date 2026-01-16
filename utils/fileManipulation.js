import * as FileSystem from 'expo-file-system';

export async function moveFile(_id) {
  const sourcePath = FileSystem.documentDirectory + `userpendingList/profilePics/${_id}_profile_pic.jpg`;
  const destinationDir = FileSystem.documentDirectory + `usercontactList/profilePics/`;
  const destinationPath = destinationDir + `${_id}_profile_pic.jpg`;

  try {
    const dirInfo = await FileSystem.getInfoAsync(destinationDir);
    if (!dirInfo.exists) {
      console.log("Directory does not exist. Creating it...");
      await FileSystem.makeDirectoryAsync(destinationDir, { intermediates: true });
    }
    const sourceFileInfo = await FileSystem.getInfoAsync(sourcePath);
    if (!sourceFileInfo.exists) throw new Error("Source file does not exist");
    await FileSystem.moveAsync({
      from: sourcePath,
      to: destinationPath,
    });
  } 
  catch (error) {console.error("Error moving file:", error);}
}

export async function deleteFile(_id) {
  const filePath = FileSystem.documentDirectory + `userpendingList/profilePics/${_id}_profile_pic.jpg`;
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      console.log("File does not exist");
      return;
    }
    await FileSystem.deleteAsync(filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

export async function checkIfFileExists(id) {
  const imageUri = `${FileSystem.documentDirectory}usercontactList/profilePics/${id}_profile_pic.jpg`;
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    return fileInfo.exists;
  } catch (error) {
    console.error(' Error checking file existence:', error);
    return false;
  }
}

export async function deleteContactFile(_id) {
  const filePath = FileSystem.documentDirectory + `usercontactList/profilePics/${_id}_profile_pic.jpg`;
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      console.log("File does not exist");
      return;
    }
    await FileSystem.deleteAsync(filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

