const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const staffSchema = new Schema(
    {
    name: {type: String, required: true},
    new_course: {type: String, required: true},
    new_level: {type: String, required: true},
    password: {type: String, required: true},
    new_dept: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true}
});

const Staff = mongoose.model('Staff', staffSchema)

module.exports = Staff