import { Platform, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

// Remembered for the current app session so the folder is asked only once.
let savedDirectoryUri = null;

// "SSST/1002" -> "SSST_1002" (slashes etc. break file paths)
const safeName = (name) => String(name || 'Invoice').replace(/[^a-zA-Z0-9]/g, '_');

// Opens the share sheet (Save to Files / Drive / WhatsApp ...).
// The file is first copied to the cache folder and, on Android, converted to a
// content:// URI - this fixes "Not allowed to read file under given URL".
const shareFile = async (cachePath, title) => {
  let shareableUri = cachePath;
  if (Platform.OS === 'android') {
    shareableUri = await FileSystem.getContentUriAsync(cachePath);
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(shareableUri, {
      mimeType: 'application/pdf',
      dialogTitle: title,
      UTI: 'com.adobe.pdf',
    });
  } else {
    Alert.alert('PDF created', `Saved at: ${cachePath}`);
  }
};

/**
 * Creates the PDF from HTML and saves it straight to the phone (no print dialog).
 *  - Android: saves into a folder you pick once (choose "Downloads"), then silently every time.
 *  - iOS: shows the Save/Share sheet (iOS does not allow silent downloads).
 *  - Web: falls back to the normal print / save-as-PDF dialog.
 */
export const savePdfToDevice = async (html, baseName) => {
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }

  const name = safeName(baseName);
  // Ask expo-print for the PDF as base64 too, so we never have to read its temp file
  // (Expo Go blocks reading files from the "cache/Print" folder).
  const { uri, base64 } = await Print.printToFileAsync({ html, base64: true });

  // Write it to a path we control, with a clean file name
  const cachePath = `${FileSystem.cacheDirectory}${name}.pdf`;
  if (base64) {
    await FileSystem.writeAsStringAsync(cachePath, base64, { encoding: 'base64' });
  } else {
    await FileSystem.copyAsync({ from: uri, to: cachePath }); // fallback
  }

  if (Platform.OS === 'android') {
    try {
      const SAF = FileSystem.StorageAccessFramework;
      if (!savedDirectoryUri) {
        const perm = await SAF.requestDirectoryPermissionsAsync();
        if (!perm.granted) {
          await shareFile(cachePath, name); // user cancelled folder picking
          return;
        }
        savedDirectoryUri = perm.directoryUri;
      }
      const base64 = await FileSystem.readAsStringAsync(cachePath, { encoding: 'base64' });
      const fileUri = await SAF.createFileAsync(savedDirectoryUri, name, 'application/pdf');
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: 'base64' });
      Alert.alert('Downloaded', `${name}.pdf saved to your phone.`);
      return;
    } catch (err) {
      console.log('Direct save failed, using share sheet:', err.message);
      savedDirectoryUri = null;
      await shareFile(cachePath, name);
      return;
    }
  }

  await shareFile(cachePath, name); // iOS
};
