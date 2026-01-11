const fs = require('fs');
const content = `DATABASE_URL=postgresql://deneme_y2yi_user:Qcm0uAC3Q8NtbRc2NiP66GJoCf8MlTB4@dpg-d5htadvpm1nc73ebi690-a.frankfurt-postgres.render.com/deneme_y2yi
PORT=3000
`;
fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('.env file written successfully');
