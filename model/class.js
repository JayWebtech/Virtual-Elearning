const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const classSchema = new Schema(
    {
    course: {type: String, required: true},
    level: {type: String, required: true},
    classdate: {type: String, required: true},
    dept: {type: String, required: true},
    classtime: {type: String, required: true},
    descp: {type: String, required: true},
    email: {type: String, required: true},
    class_link: {type: String, required: false},
    unique: {type: String, required: true}
});
classSchema.index({dept: 'text'});
const Class = mongoose.model('Class', classSchema)

module.exports = Class