const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: [isEmail, 'Email is incorrect']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'minimum length is 6 characters']
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.statics.login = async function(email, password) {
    const user = await User.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('Password is incorrect');
    }
    throw Error('Email is incorrect');
}

const User = mongoose.model('User', userSchema);
module.exports = User;