const express= require("express");
const bodyParser= require("body-parser");
const mongoose=require("mongoose");
mongoose.set('strictQuery',false);
mongoose.connect("mongodb+srv://admin-varu:vara1234@cluster0.zt48tq2.mongodb.net/todolistDB",{useNewUrlParser:true});
const app=express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const itemsSchema= new mongoose.Schema({name:String});
const Item= mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to your todo list"
})
const item2=new Item({
    name:"Hit the + button to add new item"
});
const item3=new Item({
    name:"Hit this to delete an item"

});

const defaultItems=[item1,item2,item3];

const listSchema={  /*creating list schema*/
    name:String,
    item:[itemsSchema]
};

const List= mongoose.model("List",listSchema);




app.get("/",function(req,res){
    Item.find({},function(err,foundItems){

        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err)
                {
                    console.log("error");
                }
                else{
                    console.log("default items are saved to todolist");
                }
            });
            res.redirect("/");


        }
        else{
            res.render("List",{ListTitle:"Today",newListItems:foundItems});
        }
       
       
       
       
    });
   
  
   
});

app.get("/:customListName",function(req,res){
   const customListName=req.params.customListName ;
   List.findOne({name:customListName},function(err,foundOne){
    if(!err){
        if(!foundOne){
            //create a new lsit
            const list= new List({
                name: customListName,
                item:defaultItems
               });
               list.save();
               res.redirect("/"+customListName);
        }
        else{
            res.render("List",{ListTitle:foundOne.name,newListItems:foundOne.item});
            
        }
    }
   })
   
   
})

app.post("/",function(req,res){
    let itemName=req.body.newItem;
    let listName=req.body.list;
    const item= new Item({
        name:itemName
    });
    
    if(listName==="Today"){
        item.save();
        res.redirect("/");

    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.item.push(item);
            foundList.save();
            res.redirect("/"+listName);

        });
    }
    


});

app.post("/delete",function(req,res){
    const checkboxItemId=req.body.checkbox;
    const listName=req.body.ListName;
    if(listName==="Today"){

        Item.findByIdAndRemove(checkboxItemId,function(err){
            if(!err){
                console.log("successfully deleted");
                
            }
            res.redirect("/");
        });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkboxItemId}}},function(err){
            if(!err){
                res.redirect("/"+listName);
            }
            else{
                console.log(err);
            }
        });
    }
   
});


/*app.post("/",function(req,res){
    
   let item=req.body.newItem;
   if(req.body.list==="work list")
   {
    workItems.push(item);
    res.redirect("/work");

   }else{
    items.push(item);
    res.redirect("/");

   }
   
});*/



app.get("/about",function(req,res){
    res.render("about");
})



app.listen(3000,function(){
    console.log("server started at 3000");
})