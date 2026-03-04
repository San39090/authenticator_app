import EncryptedStorage from 'react-native-encrypted-storage';

export interface AccountData{
    id:String;
    issuer:String;
    secret:String;
    account:String;
}

const STORAGE_KEY = "2FA_SECRETS";

const StorageService = () => {
    save:async(list: AccountData[]) => {
        const json = JSON.stringify(list);
        await EncryptedStorage.setItem(STORAGE_KEY,json);
    }

    get:async() => {
        const data = await EncryptedStorage.getItem(STORAGE_KEY);
        return data?JSON.parse(data):[];
    }

    clear:async() => {
        await EncryptedStorage.removeItem(STORAGE_KEY);
    }
}

export default StorageService;