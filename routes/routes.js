const express = require('express');
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.filename + "_" + Date.now() + "_" + file.originalname);
    },
});


var upload = multer({
    storage: storage,
}).single('image');


router.get('/add', (req, res) => {
    res.render('pages/add_users', { title: "Add User" });
});

router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    });
    user.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: 'User added successfully'
            };
            res.redirect('/');
        })
        .catch((err) => {
            res.json({ message: err.message, type: 'danger' });
        });
});

// edit user route
router.get("/edit/:id", async(req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.redirect("/");
        }
        res.render("pages/edit_user", { title: "Edit User", user });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.redirect("/");
    }
});

// Get all user route

router.get('/', (req, res) => {
    User.find()
        .then((users) => {
            res.render('index', { title: "Users", users: users });
        })
        .catch((err) => {
            res.json({ message: err.message, type: 'danger' });
        });
});


// update user route
// const fs = require('fs');
// const upload = require('your-upload-middleware'); // replace with your actual upload middleware


// update user route
router.post("/update/:id", upload, async(req, res) => {
    const id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
            console.error(err); // Use console.error for error logging
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        req.session.message = {
            type: 'success',
            message: 'User updated successfully'
        };
        res.redirect("/");
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.json({ message: err.message, type: 'danger' });
    }
});

// delete user route

router.get("/delete/:id", async(req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.redirect("/");
        }
        fs.unlinkSync('./uploads/' + user.image);
        await User.findByIdAndDelete(id);
        req.session.message = {
            type: 'success',
            message: 'User deleted successfully'
        };
        res.redirect("/");
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.json({ message: err.message, type: 'danger' });
    }
});


module.exports = router;