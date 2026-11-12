import {createAccountUI} from './account-runtime/ui.js';
import {installStorageBanner} from './account-runtime/storage-banner.js';
import {storage,MATH_RECORDS} from './account-storage.js';
import {client} from './account-client.js';
const archiveSummary=snapshot=>{const r=snapshot?.data?.[MATH_RECORDS]?.records||{};return `课程 ${Object.keys(r).filter(k=>k.startsWith('math-garden:course:')).length} 节 · 闯关 ${Object.keys(r).filter(k=>k.startsWith('math-garden:challenge:')).length} 站`;};
export const {accountPanel,parentIdentity}=createAccountUI({subject:'math',storage,client,archiveSummary});
installStorageBanner(storage);
