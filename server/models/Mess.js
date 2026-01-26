import mongoose from 'mongoose';

const messSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    messCode: {
        type: String,
        required: true,
        unique: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String
    },
    totalStudents: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Mess = mongoose.model('Mess', messSchema);

export default Mess;
