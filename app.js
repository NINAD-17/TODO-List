const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require ('lodash');
// const date = require (__dirname + '/date.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

// Connect MongoDB using mongoose
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

// Schema of items
const itemSchema = new mongoose.Schema({
    name: String
});

// Model
const Item = mongoose.model('Item', itemSchema);

// Default items
const item1 = new Item({
    name: 'Welcome to your todolist!'
});

const item2 = new Item({
    name: 'Hit the + button to add new item.'
});

const item3 = new Item({
    name: '<-- Hit this to delete item.'
});

const defaultItems = [item1, item2, item3];

// custom List Schema
const listSchema = {
    name: String, // List name
    items: [itemSchema] // All items inside it
}

// model of custom list schema
const List = mongoose.model ('List', listSchema);

app.get('/', (req, res) => {
    // let day = date.getDate ();
    Item.find((err, allItems) => {
        if (allItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err)
                    console.log('Something went wrong!', err);
                else
                    console.log('Successfuly inserted all items to DB.');
            });
            res.redirect ('/');
        } else {
            if (err)
                console.log('Something went wrong! ', err);
            else
                res.render('lists', { listTitle: 'Today', allTasks: allItems });
        }
    });
});

app.post('/', (req, res) => {
    const itemName = req.body.newItem; // It's new task which is added by user
    const listName = req.body.list;
    
    // Create document of new Item
    const newItem = new Item ({
        name: itemName
    });

    if (listName === 'Today') {
        newItem.save();
        res.redirect('/');
    } else {
        List.findOne ({name: listName}, (err, foundList) => {
            foundList.items.push (newItem);
            foundList.save();
            res.redirect (`/${listName}`);
        })
    }

    
});

app.get ('/:customListName', (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne ({name: customListName}, (err, result) => {
        if (result != null) {
            res.render ('lists', {listTitle: result.name, allTasks: result.items})
        } else {
            const list = new List({
                name: customListName,
                items: defaultItems
            });

            list.save();
            res.redirect (`/${customListName}`);
        }
    });
});

app.post ('/delete', (req, res) => {
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === 'Today') {
        Item.findByIdAndRemove(checkedItem, (err) => {
            if (err)
                console.log('Something went wrong!', err);
            else
                console.log('Successfully deleted checked Item');
        });
        res.redirect('/');
    } else {
        List.findOneAndUpdate ({name: listName}, {$pull: {items: {_id: checkedItem}}}, (err, foundList) => {
            if (err) 
                console.log ('Something went wrong', err);
            else 
                res.redirect (`/${listName}`);
        })
    }
})

app.listen(3000, () => console.log('Server started on port 3000!'));