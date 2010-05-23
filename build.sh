# build collection.js
cd src/collection
juicer merge src/collection.js --force -o collection.js

# build chart.js
cd ../..
juicer merge src/chart.js --force -o chart.js