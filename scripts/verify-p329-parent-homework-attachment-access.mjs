import fs from 'node:fs';
const source=fs.readFileSync(new URL('../apps/parent-mobile/App.tsx',import.meta.url),'utf8');
const checks=[
 ['attachment rows rendered',source.includes('Submission attachments')&&source.includes('styles.attachmentRow')],
 ['security status surfaced',source.includes('Security status:')&&source.includes('status.replaceAll')],
 ['CLEAN-only action gate',source.includes('const cleared=status==="CLEAN"')],
 ['offline open blocked',source.includes('if(!selected||offlineSession)return;')],
 ['parent document download endpoint',source.includes('/documents/${encodeURIComponent(attachmentId)}/download?kind=homework')],
 ['secure download URL read',source.includes('result?.data?.downloadUrl')],
 ['Expo Linking used',source.includes('await Linking.openURL(url)')],
 ['per-attachment loading state',source.includes('openingHomeworkAttachment[file.id]')],
 ['tap guard disables repeated opening',source.includes('disabled={offlineSession||openingHomeworkAttachment[file.id]}')],
 ['accessible attachment action label',source.includes('accessibilityLabel={`Open homework attachment ${file.displayName}`}')],
 ['error feedback',source.includes('Unable to open homework attachment. Please retry while online.')],
 ['row style added',source.includes('attachmentRow:{flexDirection:"row",alignItems:"center"')]
];
for(const [name,pass] of checks)console.log(`${pass?'PASS':'FAIL'} ${name}`);
console.log(`P329 static verifier: ${checks.filter(x=>x[1]).length}/${checks.length} PASS`);
if(checks.some(x=>!x[1]))process.exitCode=1;
