import * as SecureStore from 'expo-secure-store';
const KEY='school.transport.driver.session.v1';
export type DriverConfig={apiBase:string;organizationId:string;schoolId:string;token:string};
export async function saveDriverConfig(value:DriverConfig){await SecureStore.setItemAsync(KEY,JSON.stringify(value));}
export async function readDriverConfig():Promise<DriverConfig|null>{const raw=await SecureStore.getItemAsync(KEY);if(!raw)return null;try{return JSON.parse(raw) as DriverConfig;}catch{return null;}}
export async function clearDriverConfig(){await SecureStore.deleteItemAsync(KEY);}
