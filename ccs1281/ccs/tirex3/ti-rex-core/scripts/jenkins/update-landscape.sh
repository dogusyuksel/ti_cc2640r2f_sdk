# clean build files
npm run clean

# build yourself
npm run build

# make a production build
npm run buld -- --production

# put it in the landscape
rm -rf ~/ccs-cloud.local/tirex3-backup
mv ~/ccs-cloud.local/tirex3 ~/ccs-cloud.local/tirex3-backup
cp -r target/production/tirex3 ~/ccs-cloud.local

# restart
dcontrol restart tirex3

# update db
node scripts/tirex-scripts-dev.js update-db
