import {File,Directory,Paths} from 'expo-file-system';

export async function moveFile(_id) {
  /*const sourcePath = FileSystem.documentDirectory + `userpendingList/profilePics/${_id}_profile_pic.jpg`;
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
  catch (error) {console.error("Error moving file:", error);}*/
  try{
    const userDirectory = new Directory(Paths.document,"user");
    const source_dir = new Directory(userDirectory,"pendingListProfilePics");
    const source_file_path = new File(source_dir,`${_id}_profile_pic.jpg`);

    const destination_dir = new Directory(userDirectory,"contactListProfilePics");
    if (!destination_dir.exists) destination_dir.create();
    const destination_path = new File(destination_dir,`${_id}_profile_pic.jpg`);

    if (!sourceFileInfo.exists) throw new Error("Source file does not exist");
    source_file_path.move(destination_path);
  }
  catch(error) {console.error("Error moving file:", error);}
}

export async function deleteFile(_id) {
  /*const filePath = FileSystem.documentDirectory + `userpendingList/profilePics/${_id}_profile_pic.jpg`;
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
  */
  try{
    const user_directory = new Directory(Paths.document,"user");
    const pendingDir = new Directory(user_directory,"pendingListProfilePics");
    const filePath = new File(pendingDir,`${_id}_profile_pic.jpg`);
    if (!filePath.exists) return;
    filePath.delete();
  }
  catch(error){ console.log(error); }
}

export async function checkIfFileExists(id) {
  /*
  const imageUri = `${FileSystem.documentDirectory}usercontactList/profilePics/${id}_profile_pic.jpg`;
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    return fileInfo.exists;
  } catch (error) {
    console.error(' Error checking file existence:', error);
    return false;
  }*/
  try{
    const imageDir = new Directory(Paths.document,"user","pendingListProfilePics");
    const imagePath = new File(imageDir,`${id}_profile_pic.jpg`);
    return imagePath.exists
  }
  catch (error) {
    console.error(' Error checking file existence:', error);
    return false;
  }
}

export async function deleteContactFile(_id) {
  /*
  const filePath = FileSystem.documentDirectory + `usercontactList/profilePics/${_id}_profile_pic.jpg`;
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      console.log("File does not exist");
      return;
    }
    await FileSystem.deleteAsync(filePath);
  } 
  catch (error) {
    console.error("Error deleting file:", error);
  }*/
  try{
    const contactDir = new Directory(Paths.document,"user","contactListProfilePics");
    const filePath   = new File(contactDir,`${_id}_profile_pic.jpg`);
    if (!filePath.exists) return;
    filePath.delete();
  }
  catch(error){
    console.error("Error deleting file:", error);
  }
}

