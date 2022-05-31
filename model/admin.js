const mongoose = require("mongoose")
const AdminSchema = new mongoose.Schema(
    {
    uname: {type: String, required: true, unique: true},
    pword: {type: String, required: true}
},
{collection:  'admin' }
)

const model = mongoose.model('AdminSchema', AdminSchema)

module.exports = model