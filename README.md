# Usage

```javascript
import nGramTextSearch from 'mongoose-plugin-ngram-text-search';

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  username: String,
  // your other fields...
});

// function used to extract to text to indexing from a field
const extractUsernameFromEmail = (str = '') => str.split('@')[0];

userSchema.plugin(nGramTextSearch, {
  nGramSizeMin: 1,
  nGramSizeMax: 8,
  edgeNGrams: true,
  fields: [
    { name: 'username' },
    { name: 'name' },
    { name: 'email', extractFn: extractUsernameFromEmail },
  ],
});
```