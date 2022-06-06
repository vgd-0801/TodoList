//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const lodash = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://gayatri:miryalaguda@cluster0.wlfh2.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema={
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Yayy!"
});

const item3 = new Item({
  name: "Bring it onn!"
});

const defaultItems = [item1, item2, item3];

const listSchema ={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err)
        }
        else{
          console.log("Succesfully added all the items into the todolistDB.");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname = req.body.list;

  const newitem = new Item({
    name: itemName
  });

  if(listname==="Today"){
    newitem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listname},function(err,foundlist){
      foundlist.items.push(newitem);;
      foundlist.save();
      res.redirect("/"+listname);
    })
  }

});

app.post("/delete",function(req,res){
  const deleteditemId = req.body.checkbox;
  const listname = req.body.deleteitemlistname;
  if(listname==="Today")
  {
    Item.deleteOne({_id: deleteditemId}, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully deleted!");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listname},{$pull: {items: {_id: deleteditemId}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listname);
      }
    });
  }

});


app.get('/:customListname', function (req, res) {
  const customListname = lodash.capitalize(req.params.customListname);

  List.findOne({name: customListname},function(err,foundlist){
    if(!err){
      if(!foundlist){
        //create new list
        const list = new List({
          name: customListname,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListname);
      }
      else{
        //display existing list
        res.render("list",{listTitle: customListname, newListItems: foundlist.items});
      }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started succesfully");
});
