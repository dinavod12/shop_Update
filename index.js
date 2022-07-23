// jshint esversion:6

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const res = require('express/lib/response');
const mongoose = require('mongoose');
//const encrypt = require('mongoose-encryption');
const app = express();
var nodemailer = require('nodemailer');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
//const md5 = require('md5');
var router = require("express").Router();
//require("dotenv").config();


app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  }));
  
app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb://localhost:27017/shopDB", { useNewUrlParser: true });
//mongoose.set("useCreateIndex", true);

//date and day and time

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const d = new Date();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
var events = require('events');
var eventsEmitter = new events.EventEmitter();

//Home 

app.get('/home',function(req,res){
    if (req.isAuthenticated()){
    var user = req.user;
    contain_all()
    res.render('Home')
    }else{res.redirect('/login')}
})





//All

const dict_all={}
var list_button = [];


// User


const itemsSchema = {
  name: String,
  qty:Number,
  Unit_Price:Number,
};

const Item = mongoose.model("Item", itemsSchema);

const dict_name = {}

const list_item = ["Rice","Cured","Wheate","Snickers","KitKat","Almod Milk","Dairy Milk","Butterfinger",
"Cheese","Sandwich","Bread","Veg Rolls","Pies","Cookies","Non Veg Rolls","Coca Cola","7UP","Fanta",
"PineApple","Maaza","Red Blue","Bread","Rolls","Cookies","Pies","Pastries","Muffins"]

const list_all_item=[]

for (var i = 0; i<list_item.length; i++){
    var item = new Item({
        name: String(list_item[i]),
        qty:0,
        Unit_Price:0
      });
    list_all_item.push(item);
    dict_name[list_item[i]] = 0;
}

const item_list_id = [];
const price_list_id = [];

app.get("/user", function(req, res) {
    console.log(dict_name);
    Item.find({}, function(err, foundItems){
      
      if (foundItems.length === 0) {
        Item.insertMany(list_all_item, function(err){
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully savevd default items to DB.");
            console.log(foundItems)
          }
        });
        res.redirect("/user");
      } else {
        console.log('user',req.user)
        res.render("list", { newListItems: foundItems});  
      }
    });
  });
  

app.post("/user", function(req, res){
    const itemName = req.body.newItem;
  
    const item = new Item({
      name: itemName,
      qty: 0,
      Unit_Price:0,
    });
    item.save();
    dict_all[itemName] = 0;
    dict_name[itemName] = 0;
    res.redirect("/user");
});




app.post("/user/add/price",function(request,response){
    const item_price = request.body.price_add;
    price_list_id.push(item_price);

    console.log('user item_price','=',item_price);

    if ( price_list_id.length === 2 ){
        let z = price_list_id.shift();
        let p = price_list_id.shift(); 


        Item.findByIdAndUpdate(z,{ Unit_Price : p },function(err,docs){
            if (!err){
                price_list_id.splice(0,price_list_id.length);
                response.redirect('/user');
               
                }
        });

        Item.find({'_id':z},function(err,docs_name){
            if (!err){
                docs_name.forEach(function(docs_item_name){
                    dict_all[docs_item_name.name] = parseInt(p)
                })
            }
        })
        

    }

})


app.post('/user/add',function(request,response){
    const item45 = request.body.item_add;
    item_list_id.push(item45); 

    console.log('user item45','=',item45);

    if ( item_list_id.length === 2 ){
        const qty_item_prod = [];
        let x = item_list_id.shift();
        let y = item_list_id.shift();


        Item.find({'_id':x},function(err,items_founds){
            items_founds.forEach(function(items_qty){
                qty_item_prod.push(items_qty.qty)
            })
            let zx = parseInt(qty_item_prod.shift());      
            
            Item.findByIdAndUpdate(x,{ qty : parseInt(y) + zx },function(err,docs){
                if (!err){
                    dict_name[docs.name] = parseInt(docs.qty)+parseInt(y);
                    item_list_id.splice(0,item_list_id.length);
                    response.redirect('/user');   
                   
                  }
               })
        });
        }

})


app.post("/user/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    
    Item.find({'_id':checkedItemId},function(err,item_name){
        if(!err){
            var buttonIndex = list_button.indexOf(item_name.name);
            list_button.splice(buttonIndex, 1);
        }
    })

    Item.findByIdAndRemove(checkedItemId, function(err){
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/user");
        }
      });
  
  });



















































// Customer 
 
let dict_sum_total = []

// eat 

const eat_func = require(__dirname+"/eat.js");

var texts_e=[];
var texts = [];
//var texts_unit = [[19.30], [20.00], [12.00]];
var texts_id = [];
var texts_total = [];
var list_e = ["Rice","Cured","Wheate" ];
var text_qty_e = [];
var text_name_e=[];
var text_Eat_id=[]

// soft_drink
var texts_d = [];
//var texts_unit_d = [[19.30], [20.00], [12.00],[20.10],[5.00],[9.00]]
var texts_id_d = [];
var texts_total_d = [];
var list_d = ["Coca Cola","7UP","Fanta","PineApple","Maaza","Red Blue"]
var text_qty_d = [];
var text_name_d=[];

// snaks and candy
var texts_snaks = [];
//var texts_unit_snaks = [[20.00], [12.00],[20.10],[5.00],[9.00]];
var texts_id_snaks = [];
var texts_total_snaks = [];
var list_snaks = ["Snickers","KitKat","Almod Milk","Dairy Milk","Butterfinger"]
var text_qty_snaks = [];
var text_name_snaks=[];



var text_bk = [];
var text_bk_l = [];
let text_type_value=[];

//mongoose

const itemSchema =({
    name:String,
    qty: Number,
    Unit_Price: Number,
    Discount:Number,
    Total: Number,
    timestamp: { type: Date, default: Date.now},
}) 

const Shop = mongoose.model("Shop", itemSchema);

/*const itemSchema = new mongoose.Schema ({
    name: String,
    qty: Number,
    Unit_Price: Number,
    Discount:Number,
    Total: Number,
    timestamp: { type: Date, default: Date.now},
    email: String,
    password: String
}) 

itemSchema.plugin(passportLocalMongoose);

const Shop = new mongoose.model("Shop", itemSchema);


passport.use(Shop.createStrategy());

//passport.serializeUser(Shop.serializeUser());

passport.deserializeUser(Shop.deserializeUser());*/


// Total Sum

let list_total_sum = []

let dict_total_price = []

function contain_all(){

// Eat


let list_total_discount = [];

let dict_eta_value = {}
let dict_total_value={}
let dict_type_value=[]
let dict_total_discount_eat = {}

app.get('/', function (req, res) {
    
    //Home Page

    const total_discount = req.body.total_dis;

    console.log('list_total_discount1','=',list_total_discount)
                                                                                                                                                                                                                                                                                                                                                      

    Item.find({},function(err,item_found){
        item_found.forEach(function(item_founds){
            dict_name[item_founds.name] = item_founds.qty 
            dict_all[item_founds.name] = item_founds.Unit_Price
        })
    })
      
    console.log('list_total_discount2','=',list_total_discount)


    g=text_Eat_id.shift()
    texts_id.splice(0,texts_id.length);
    texts_total.splice(0,texts_total.length);
    
    console.log('list_total_discount3','=',list_total_discount)

    
    Shop.find({'_id':g}, function (err, founditem){   

        var list_total_item = [];
        founditem.forEach(function(eat_items){
            eat_items.name.length 
            dict_eta_value[eat_items.name] = [eat_items.id,eat_items.qty,eat_items.Unit_Price,eat_items.Discount,eat_items.Total]
            dict_total_value[eat_items.name] = [eat_items.Total];
            dict_type_value[eat_items.name] = [eat_items.id,eat_items.qty,eat_items.Unit_Price,eat_items.Discount,eat_items.Total]
        })
        
        for (const value of Object.values(dict_total_value)) {
            list_total_item.push(parseFloat(value))
        }
        let sum = 0;
        
        for (let i = 0; i < list_total_item.length; i++) {
            sum += list_total_item[i];
        }
        
        var total_list_price = [];
        dict_total_price['Eat'] = sum
        

        for (const value of Object.values(dict_total_price)) {
            total_list_price.push(parseFloat(value))
        }
        let sum1 = 0;
        for (let i = 0; i < total_list_price.length; i++) {
            sum1 += total_list_price[i];
        } 
        
        let sum2 = 0;
        if ( list_total_sum.length != 0 ){
            for (let i = 0; i < list_total_sum.length; i++) {
                sum2 += list_total_sum[i];
        }
        }  

        //list_total_sum.push(sum1);
        
        dict_sum_total['total'] = sum1 ;

        console.log('list_total_discount4','=',list_total_discount)

        if (list_new_cell.length > 0){
            dict_eta_value = {}
            texts = []
            dict_total_value = {}
            total_list_price = []
            list_total_sum = []
            dict_total_price = {}
        }

        list_new_cell = []

        var total_taxes = 0
        var discount_total = 0
        
        if (list_total_discount.length != 0){
            var value = parseInt(list_total_discount.shift())
            var discount_total = value
            var total_taxes = (sum1-sum2) - value/100 * (sum1-sum2)
        }
        
        console.log('total_taxes',total_taxes);

        res.render('list1', { texts1: dict_eta_value, texts: texts , subsum:sum1-sum2 , total_tax: total_taxes , discount_total:discount_total});

    })

    /*Shop.find({}, function (err, founditem) {   
        if (!err){            let dict_total_value={};
            let list_total_item=[];
            founditem.forEach(function(items){
                dict_total_value[items.name] =  parseFloat(items.Total) ;           
            })
        for (const value of Object.values(dict_total_value)) {
            list_total_item.push(value)
        }
        let sum = 0;
        for (let i = 0; i < list_total_item.length; i++) {
            sum += list_total_item[i];
        }
        console.log(sum)     
    }
   
    res.render('list1', { texts1: founditem, texts: texts});   

    })*/


}); 

//New Cell

let text_contain_item = [];
let list_new_cell = [];

app.post('/new_cell',function(request,response){

    const newcell = request.body.ncell;
    list_new_cell.push(newcell);
    response.redirect('/')
})


app.post('/', function (request, response) {
    const text2 = request.body.Rice;
    const text1 = request.body.item;

    //const total_discount = request.body.total_dis;

   // console.log('Total_discount','=',total_discount);
    console.log(dict_all[text2]);

    if (texts.includes(text2) === true) {
        response.send('<script> alert("Already There click on add to add more")</script>');
    } else {
        texts.push(text2);
        text_type_value.push(text2);
        texts_e.push(text2)
        const item_E = new Shop({
            name: text2,
            qty: 1,
            Unit_Price: dict_all[text2],
            Discount : 0,
            Total: dict_all[text2]
        });
        item_E.save()
        text_Eat_id.push(item_E._id)

        text_contain_item.push(text2);



        //for (let xy=0 ; xy<text_contain_item.length ; xy++){
        //    console.log('text_xontain_item',text_contain_item)
          //  console.log('text2','=',text2)
           // Register.findById(request.user.id,function(err,founduser){
            //    if (founduser){
                  //  founduser.name = text2, 
                //    founduser.qty = 1, 
                //    founduser.Unit_Price = dict_all[text2],
                //    founduser.Discount = 0,
              //      founduser.Total = dict_all[text2]           
              //  }
                //founduser.save()
            //});

        //}
        

         
        //Register.find({},function(err,founditemsuser){
         //   console.log('Register','=',founditemsuser)
        //})
        
        
      
        
    }
    let total_value = request.body.total_dis;
    var zd = dict_sum_total['total'];
    console.log('total_value','=',total_value);
    dict_total_discount_eat['tax'] = zd - total_value/100*zd
    console.log('dict_total_discount',dict_total_discount_eat)
    response.redirect('/');

});


//total_discount_Eat

app.post('/total_discount',function(req,res){
    const total_discount = req.body.total_dis;
    console.log('Total_discount','=',total_discount);
    list_total_discount.push(total_discount)
    res.redirect('/') 
})


//current user

app.get('/current_user',function(req,res){
    const userid = req.params.id;
    Shop.find({ _id : userid},function(err,user){
        console.log('current_user','=',user);
        if (!err){
            res.json({ message:"user list" , data:user})
        }
    })
})


/*app.get('/current_user',function(req,res){
    console.log('text_contain_item','=',text_contain_item);
    for (let xy=0 ; xy<text_contain_item.length ; xy++){
            Register.findById(req.user.id,function(err,founduser){
                var contain_name = text_contain_item[xy];
                console.log('text_contain_item[xy]',contain_name)
                if (founduser){
                    founduser.name = text_contain_item[xy], 
                    founduser.qty = 1, 
                    founduser.Unit_Price = dict_all[contain_name],
                    founduser.Discount = 0,
                    founduser.Total = dict_all[contain_name]           
                }
                founduser.save()
            });

        }
        

         
        Register.find({},function(err,founditemsuser){
            console.log('Register','=',founditemsuser)
        })
})*/


//eat_func.Eat_func()

app.post('/add',function(req,res){
    const text45 = req.body.add;
    const text46 = req.body.sub;
  

    console.log('text45','=',text45)

    
    try{
        text46.length;
        console.log('texts46','=',text46)
        let sub_Eat_item_name = [];
        texts_id.push(text45);
        Shop.find({'_id':text46},function(err,found){
            found.forEach(function(items_eat){
                texts_total.push(items_eat.Total);
                text_qty_e.push(items_eat.qty);
                text_name_e.push(items_eat.name);
                sub_Eat_item_name.push(items_eat.name);

            })

            var x = text46;
            var z = text_qty_e.shift()-1;
            var sxy = sub_Eat_item_name.shift();
            var szy = dict_name[sxy];
            var y = dict_all[sxy];
            Shop.findByIdAndUpdate(x,{ qty : z , Total : texts_total.shift()-y} ,function(err,docs){
                   if (!err){
                         texts_total.splice(0,texts_total.length);
                         text_qty_e.splice(0,text_qty_e.length);
                         sub_Eat_item_name.splice(0,sub_Eat_item_name.length);
                         text_Eat_id.push(x)
                         res.redirect('/');
                       }
                    })
            Item.findOneAndUpdate({ name : sxy },{ qty : parseInt(szy) + parseInt(1)},function(err,docs1){
                if (!err){
                            dict_name[sxy] = parseInt(szy) + parseInt(1);
                            console.log('Done sub');
                        }
            });
   
    })
        
    
    }
    catch{
    texts_id.push(text45)
    console.log('text_id',texts_id)
    if ( texts_id.length === 2 ){
        const Eat_item_prod = [];
        const Eat_item_name=[];
        let x = texts_id.shift();
        let y = texts_id.shift();      

        Shop.find({'_id':x},function(err,items_founds){
            console.log('items_found','=',items_founds)
            let unit_price = [] ;
            items_founds.forEach(function(items_qty){
                Eat_item_prod.push(items_qty.qty);
                Eat_item_name.push(items_qty.name);
                texts_total.push(items_qty.Total)
                unit_price.push(items_qty.Unit_Price)
            })
            let zx = parseInt(Eat_item_prod.shift());
            let xy = Eat_item_name.shift();
            let zy = dict_name[xy];
            
            //Email

             
            if (parseInt(zy) - parseInt(y) < 5 ) {
                var value_left = String(parseInt(zy) - parseInt(y)) 
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'rp9541439@gmail.com',
                      pass: 'tsgqdgrgzefwdvwx'
                    }
                  });
                  
                  var mailOptions = {
                    from: 'rp9541439@gmail.com',
                    to: 'ankit9541439@gmail.com',
                    subject: 'Amount Left',
                    text: 'Your Quantity name ='+ " " + xy + " "+ 'Has Only Left '+ " " + value_left + " "+'Quantity',
                    
                    };

                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
            }


            if (parseInt(zy) - parseInt(y) >= 0 ){
                var tt = texts_total.shift()
                var ttu = unit_price.shift()
                console.log('ttu',ttu)
                if (y === 1){Shop.findByIdAndUpdate(x,{ qty : parseInt(y) + zx , Total : tt * 2  },function(err,docs){
                    if (!err){
                       texts_total.splice(0,texts_total.length);
                       text_Eat_id.push(x)
                       res.redirect('/');
                      }
                    });}else{
                Shop.findByIdAndUpdate(x,{ qty : parseInt(y) + zx , Total : ttu * y + tt },function(err,docs){
                    if (!err){
                       unit_price.splice(0,unit_price.length);
                       texts_total.splice(0,texts_total.length);
                       text_Eat_id.push(x)
                       res.redirect('/');
                      }
                    });
                }
                Item.findOneAndUpdate({ name : xy },{ qty : parseInt(zy) - parseInt(y)},function(err,docs1){
                    if (!err){
                        dict_name[xy] = parseInt(zy) - parseInt(y);
                        console.log('Done');
                    }
                    });
            } else{
                res.send('<script> alert("You have only ${zy}")</script>');
            }  
            });
    }
    }
   
});
 

let sub_dcount_Eat_item_total = [];
let early_dcount_total = [];

let list_y = [];
let Name_item_qty = [];

app.post('/discount',function(req,res){

    const text45 = req.body.dcount;
    const text46 = req.body.sub_dcount;
    
    try{
        text46.length;
        texts_id.push(text45);
        var x = text46;
        var Discount_list = [];

        Shop.find({'_id':x},function(err,items_founds){
            items_founds.forEach(function(items_qty){
                Discount_list.push(items_qty.Discount);
            })
            console.log('Name_item',Name_item_qty);
            xp = Name_item_qty.shift().toFixed(2);
            yamont = list_y.pop()
            console.group(list_y,'lisy')
            back = xp - (parseInt(yamont)-1)/100*xp;
            list_y.push(parseInt(yamont)-1);
            Name_item_qty.push(parseInt(xp));
            
            console.log('Total',back);
            Shop.findByIdAndUpdate(x,{ Discount: parseInt(Discount_list.shift())-1 ,Total :  back} ,function(err,docs){
                if (!err){
                      sub_dcount_Eat_item_total.splice(0, sub_dcount_Eat_item_total.length);
                      Discount_list.splice(0, Discount_list.length);
                      text_Eat_id.push(x)
                      res.redirect('/');
                    }
                 })
            })
        
    }

    catch{
    
    texts_id.push(text45);
   
    if ( texts_id.length === 2 ){
        let x = texts_id.shift();
        let y = texts_id.shift();

        list_y.push(y);

        /*Shop.find({'_id':x},function(err,found){
            found.forEach(function(value){
                  sub_dcount_Eat_item_total.push(value.Total);
                  early_dcount_total.push(value.Total);
              })
            console.log('inside',sub_dcount_Eat_item_total);
          })

        
        let tp = parseInt(sub_dcount_Eat_item_total.shift())
        let td = tp - parseInt(y)/100*tp*/

        let Distcount_item_prod = [];
    
        Shop.find({'_id':x},function(err,items_founds){
                items_founds.forEach(function(items_qty){
                    Distcount_item_prod.push(items_qty.Discount);
                    sub_dcount_Eat_item_total.push(items_qty.Total);
                    early_dcount_total.push(items_qty.Total);
                    Name_item_qty.push(items_qty.Total);
                })
                let tp = sub_dcount_Eat_item_total.shift().toFixed(2)
                let td = tp - parseInt(y)/100*tp
                let zx = Distcount_item_prod.shift();
                Shop.findByIdAndUpdate(x,{ Discount : parseInt(y) +zx, Total : td },function(err,docs){
                    if (!err){
                            sub_dcount_Eat_item_total.splice(0,sub_dcount_Eat_item_total.length);
                            text_Eat_id.push(x)
                            res.redirect('/');
                              }
                            });
                        });
        
        }
        }
   
});


app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;

    //Shop.find({'_id':checkedItemId},function(err,founditem){
      //  if (!err){
        //    founditem.forEach(function(value){
          //    tind = texts.indexOf(value.name);
            //  console.log('value.name',value.name);
             // delete texts[tind];
             // delete dict_total_value[value.name];
             // delete dict_eta_value[value.name];
             // console.log('dict_eta_value',dict_eta_value);
           // })
       // }
    //})

    Shop.findByIdAndRemove(checkedItemId, function(err){
            if (!err) {
              console.log("Successfully deleted checked item.");
               res.redirect("/");
            }
        })

     // });

  
  });




// soft drink


let text_drink_id =[]
var dict_total_value_d = []

app.get('/drink', function (req, res) {

    //Home Page
    Item.find({},function(err,item_found){
        item_found.forEach(function(item_founds){
            dict_name[item_founds.name] = item_founds.qty 
            dict_all[item_founds.name] = item_founds.Unit_Price
        })
    })

   
    g=text_drink_id.shift()
    texts_id_d.splice(0,texts_id_d.length);
    texts_total_d.splice(0,texts_total_d.length);
 
    Shop.find({'_id':g}, function (err, founditem) {
        var list_total_item = [];
        founditem.forEach(function(drink_items){
            dict_eta_value[drink_items.name] = [drink_items.id,drink_items.qty,drink_items.Unit_Price,drink_items.Discount,drink_items.Total]
            dict_total_value_d[drink_items.name] = [drink_items.Total];
        })
         
        console.log('list_new_cell',list_new_cell);

        for (const value of Object.values(dict_total_value_d)) {
            list_total_item.push(parseFloat(value))
        } 
        let sum = 0;
        for (let i = 0; i < list_total_item.length; i++) {
           sum += list_total_item[i];
              }
        
        var total_list_price = [];
        dict_total_price['Drink'] = sum  
      
        for (const value of Object.values(dict_total_price)) {
            total_list_price.push(parseFloat(value))
        }
        let sum1 = 0;
        for (let i = 0; i < total_list_price.length; i++) {
                sum1 += total_list_price[i];
        }   
        
        let sum2 = 0;
        if ( list_total_sum.length != 0 ){
            for (let i = 0; i < list_total_sum.length; i++) {
                sum2 += list_total_sum[i];
        }
        }

        dict_sum_total['total'] = sum1 ;

        if (list_new_cell.length > 0){
            dict_eta_value = {}
            texts = []
            dict_total_value = {}
            total_list_price = []
            list_total_sum = []
            dict_total_price = {}
        }

        list_new_cell = []

        var total_taxes = 0
        var discount_total = 0
        
        if (list_total_discount.length != 0){
            var value = parseInt(list_total_discount.shift())
            var discount_total = value
            var total_taxes = (sum1-sum2) - value/100 * (sum1-sum2)
        }

        res.render('soft drink', { texts1: dict_eta_value, texts: texts, subsum:sum1-sum2, total_tax:total_taxes , discount_total:discount_total});     
    })
});


//total_discount_drink

app.post('/total_discount_drink',function(req,res){
    const total_discount = req.body.total_dis;
    console.log('Total_discount','=',total_discount);
    list_total_discount.push(total_discount)
    res.redirect('/drink') 
})

app.post('/drink', function (request, response) {

    const text2 = request.body.Rice;
    const text1 = request.body.item;


    if (texts.includes(text2) === true) {
        response.send('<script> alert("Already There click on add to add more")</script>');
    } else {
       texts.push(text2);
       texts_d.push(text2)
        const item_E = new Shop({ 
            name: text2,
            qty: 1,
            Unit_Price: dict_all[text2],
            Discount : 0,
            Total: dict_all[text2]
        });
        item_E.save()
        text_drink_id.push(item_E._id)
    }
    response.redirect('/drink') 

});


app.post('/add/drink',function(req,res){ 
    const text45 = req.body.add;
    const text46 = req.body.sub;
    
    try{
        let sub_Drink_item_name = [];
        text46.length
        texts_id_d.push(text45);
        Shop.find({'_id':text46},function(err,found){
            found.forEach(function(items_drink){
                console.log(items_drink);
                texts_total_d.push(items_drink.Total);
                text_qty_d.push(items_drink.qty);
                text_name_d.push(items_drink.name);
                sub_Drink_item_name.push(items_drink.name);

            })
            var p = text46;
            var r = text_qty_d.shift()-1;
            var dxy = sub_Drink_item_name.shift();
            var dzy = dict_name[dxy];
            var q = dict_all[dxy];
            Shop.findByIdAndUpdate(p,{ qty : r , Total : texts_total_d.shift()-q} ,function(err,docs){
                if (!err){
                    texts_total_d.splice(0,texts_total_d.length);
                    text_qty_d.splice(0,text_qty_d.length);
                    sub_Drink_item_name.splice(0,sub_Drink_item_name.length);
                    text_drink_id.push(p)
                    res.redirect('/drink');
                  }
            })  

            Item.findOneAndUpdate({ name : dxy },{ qty : parseInt(dzy) + parseInt(1)},function(err,docs1){
                if (!err){
                            dict_name[dxy] = parseInt(dzy) + parseInt(1);
                            console.log('Done sub');
                        }
            });



    })

    }
 
    catch{
        texts_id_d.push(text45);
        Shop.find({},function(err,found){
            found.forEach(function(value){
                if (list_d.includes(value.name) === true){
                     texts_total_d.push(value.Total)
                      }
            })
        })
        if ( texts_id_d.length === 2 ){
            const Drink_item_name=[];
            let unit_price_drink = [];
            const Drink_item_prod = [];
            let x = texts_id_d.shift();
            let y = texts_id_d.shift();

            Shop.find({'_id':x},function(err,items_founds){
                items_founds.forEach(function(items_qty){
                    Drink_item_prod.push(items_qty.qty)
                    Drink_item_name.push(items_qty.name);
                    unit_price_drink.push(items_qty.Unit_Price);
                })
                let zx = parseInt(Drink_item_prod.shift()); 
                let xy = Drink_item_name.shift();
                let zy = dict_name[xy];

                //Email

             
                if (parseInt(zy) - parseInt(y) < 5 ) {
                var value_left = String(parseInt(zy) - parseInt(y)) 
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'rp9541439@gmail.com',
                      pass: 'tsgqdgrgzefwdvwx'
                    }
                  });
                  
                  var mailOptions = {
                    from: 'rp9541439@gmail.com',
                    to: 'ankit9541439@gmail.com',
                    subject: 'Amount Left',
                    text: 'Your Quantity name ='+ " " + xy + " "+ 'Has Only Left '+ " " + value_left + " "+'Quantity',
                    
                    };

                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                } 


                if (parseInt(zy) - parseInt(y) >= 0 ){
                    var ttd = texts_total_d.shift();
                    var ttud =  unit_price_drink.shift();
                    if ( y === 1){
                        Shop.findByIdAndUpdate(x,{ qty : parseInt(y) + zx , Total : ttd*2},function(err,docs){
                            if (!err){
                              texts_total_d.splice(0,texts_total_d.length);
                              text_drink_id.push(x)
                              res.redirect('/drink')
                        }
                        })
                    }else{
                    Shop.findByIdAndUpdate(x,{ qty : parseInt(y) + zx , Total : ttud * y + ttd },function(err,docs){
                        if (!err){
                          unit_price_drink.splice(0,unit_price_drink.length);
                          texts_total_d.splice(0,texts_total_d.length);
                          text_drink_id.push(x)
                          res.redirect('/drink')
                    }
                    })
                    }
                    Item.findOneAndUpdate({ name : xy },{ qty : parseInt(zy) - parseInt(y)},function(err,docs1){
                        if (!err){
                            dict_name[xy] = parseInt(zy) - parseInt(y);
                            console.log('Done');
                    }
                    });
                    }else{
                        res.send('<script> alert("You have only ${zy}")</script>');}  
                
        });
        }

    }
   
});


let sub_dcount_Drink_item_total = [];
let early_drcount_total = [];

let list_y_d = [];
let Name_item_qty_d = [];

app.post('/drink/discount',function(req,res){
    
    const text45 = req.body.dcount;
    const text46 = req.body.sub_dcount;
    
    try{
        text46.length;
        texts_id_d.push(text45);
        var x = text46;
        var Discount_list = [];

        Shop.find({'_id':x},function(err,items_founds){
            items_founds.forEach(function(items_qty){
                Discount_list.push(items_qty.Discount);
            })

            xp = Name_item_qty_d.shift().toFixed(2);
            yamont = list_y_d.pop()
            back = xp - (parseInt(yamont)-1)/100*xp;
            list_y_d.push(parseInt(yamont)-1);
            Name_item_qty_d.push(parseInt(xp));
            console.log('Total',back);

            Shop.findByIdAndUpdate(x,{ Discount: parseInt(Discount_list.shift())-1 ,Total :  back} ,function(err,docs){
                if (!err){
                      sub_dcount_Drink_item_total.splice(0, sub_dcount_Drink_item_total.length);
                      Discount_list.splice(0, Discount_list.length);
                      text_drink_id.push(x)
                      res.redirect('/drink');
                    }
                 })
            })
        
    }

    catch{
    
    texts_id_d.push(text45);

   /* Shop.find({},function(err,found){
      found.forEach(function(value){
        if (list_d.includes(value.name) === true){
                 sub_dcount_Drink_item_total.push(value.Total);
                 early_drcount_total.push(value.Total);
                  }
        })
    })*/

    if ( texts_id_d.length === 2 ){
        let x = texts_id_d.shift();
        let y = texts_id_d.shift();

        list_y_d.push(y);

        let Distcount_item_prod = [];
        /*let tp = parseInt(sub_dcount_Drink_item_total.shift())
        let td = tp - parseInt(y)/100*tp*/
    
        Shop.find({'_id':x},function(err,items_founds){
                items_founds.forEach(function(items_qty){
                    Distcount_item_prod.push(items_qty.Discount);
                    sub_dcount_Drink_item_total.push(items_qty.Total);
                    Name_item_qty_d.push(items_qty.Total);
                })
                let tp = sub_dcount_Drink_item_total.shift().toFixed(2);
                let td = tp - parseInt(y)/100*tp
                let zx = Distcount_item_prod.shift();
                Shop.findByIdAndUpdate(x,{ Discount : parseInt(y) +zx, Total : td },function(err,docs){
                    if (!err){
                        sub_dcount_Drink_item_total.splice(0,sub_dcount_Drink_item_total.length);
                            text_drink_id.push(x)
                            res.redirect('/drink');
                              }
                            });
                        });
        
        }
        }
   
});


/*app.post("/drink/delete", function(req, res){
    const checkedItemId = req.body.checkbox;

   //Shop.find({'_id':checkedItemId},function(err,founditem){
      //  if (!err){
         //   founditem.forEach(function(value){
            //  tind = texts.indexOf(value.name);
          //    delete texts[tind];
            //  delete dict_total_value[value.name];
            //  delete dict_eta_value[value.name];
           // })
      //  }

        Shop.findByIdAndRemove(checkedItemId, function(err){
            if (!err) {
              console.log("Successfully deleted checked item.");
               res.redirect("/drink");
            }
        })

     // });

  
  });*/



// snaks and candy


let text_snaks_id =[]
var dict_total_value_s = []

app.get('/snaks_candy', function (req, res) {

    //Home Page
    Item.find({},function(err,item_found){
        item_found.forEach(function(item_founds){
            dict_name[item_founds.name] = item_founds.qty 
            dict_all[item_founds.name] = item_founds.Unit_Price
        })
    })


   
    g=text_snaks_id.shift()
    texts_id_snaks.splice(0,texts_id_snaks.length);
    texts_total_snaks.splice(0,texts_total_snaks.length);
 
    Shop.find({'_id':g}, function (err, founditem) {
        var list_total_item = [];
        founditem.forEach(function(snaks_items){
            dict_eta_value[snaks_items.name] = [snaks_items.id,snaks_items.qty,snaks_items.Unit_Price,snaks_items.Discount,snaks_items.Total]
            dict_total_value_s[snaks_items.name] = [snaks_items.Total];
        })

        console.log('list_new_cell',list_new_cell);

        for (const value of Object.values(dict_total_value)) {
             list_total_item.push(parseFloat(value))
        }
        let sum = 0;
        for (let i = 0; i < list_total_item.length; i++) {
              sum += list_total_item[i];
        }
        
        var total_list_price = [];
        dict_total_price['Snaks'] = sum
        

        for (const value of Object.values(dict_total_price)) {
            total_list_price.push(parseFloat(value))
        }
        let sum1 = 0;
        for (let i = 0; i < total_list_price.length; i++) {
            sum1 += total_list_price[i];
        } 

        dict_sum_total['total'] = sum1 ;

        let sum2 = 0;
        if ( list_total_sum.length != 0 ){
            for (let i = 0; i < list_total_sum.length; i++) {
                sum2 += list_total_sum[i];
        }
        }

        if (list_new_cell.length > 0){
            dict_eta_value = {}
            texts = []
            dict_total_value = {}
            total_list_price = []
            list_total_sum = []
            dict_total_price = {}
        }

        list_new_cell = []

        var total_taxes = 0
        var discount_total = 0
        
        if (list_total_discount.length != 0){
            var value = parseInt(list_total_discount.shift())
            var discount_total = value
            var total_taxes = (sum1-sum2) - value/100 * (sum1-sum2)
        }        

        res.render('snaks candy', { texts1: dict_eta_value, texts: texts, subsum:sum1-sum2 ,total_tax:total_taxes, discount_total:discount_total});     
    })

});


//total_discount_snaks$candy

app.post('/total_discount_snaks_candy',function(req,res){
    const total_discount = req.body.total_dis;
    console.log('Total_discount','=',total_discount);
    list_total_discount.push(total_discount)
    res.redirect('/snaks_candy') 
})


app.post('/snaks_candy', function (request, response) {

    const text2 = request.body.Rice;
    const text1 = request.body.item;


    if (texts.includes(text2) === true) {
        response.send('<script> alert("Already There click on add to add more")</script>');
    } else {
       texts.push(text2);
       texts_snaks.push(text2)
        const item_E = new Shop({ 
            name: text2,
            qty: 1,
            Unit_Price: dict_all[text2],
            Discount:0,
            Total: dict_all[text2]
        });
        item_E.save()
        text_snaks_id.push(item_E._id)
    }
    response.redirect('/snaks_candy') 

});

let unit_price_snaks = []

app.post('/add/snaks_candy',function(req,res){
    const text45 = req.body.add;
    const text46 = req.body.sub;
    
    try{
        let sub_Snaks_item_name = [];
        text46.length
        texts_id_d.push(text45);
        Shop.find({'_id':text46},function(err,found){
            found.forEach(function(items_snaks){
                console.log(items_snaks);
                texts_total_snaks.push(items_snaks.Total);
                text_qty_snaks.push(items_snaks.qty);
                text_name_snaks.push(items_snaks.name);
                sub_Snaks_item_name.push(items_snaks.name);
            })
            
            var p = text46;
            var r = text_qty_snaks.shift()-1; 
            var snxy = sub_Snaks_item_name.shift();
            var snzy = dict_name[snxy];
            var q = dict_all[snxy];
            
            Shop.findByIdAndUpdate(p,{ qty : r , Total : texts_total_snaks.shift()-q} ,function(err,docs){
                   if (!err){
                         texts_total_snaks.splice(0,texts_total_snaks.length);
                         text_qty_snaks.splice(0,text_qty_snaks.length);
                         sub_Snaks_item_name.splice(0,sub_Snaks_item_name.length);
                         text_snaks_id.push(p)
                         res.redirect('/snaks_candy');
                       }
                })
            Item.findOneAndUpdate({ name : snxy },{ qty : parseInt(snzy) + parseInt(1)},function(err,docs1){
                    if (!err){
                                dict_name[snxy] = parseInt(snzy) + parseInt(1);
                                console.log('Done sub');
                            }
                });


    })
  
    }
    
    catch{
        texts_id_snaks.push(text45);
        Shop.find({},function(err,found){
           found.forEach(function(value){
               if (list_snaks.includes(value.name) === true){
                 texts_total_snaks.push(value.Total)
                  }
        })
        })
    
        if ( texts_id_snaks.length === 2 ){
          const Snaks_item_name=[];
          const Snaks_item_prod = [];
          let x = texts_id_snaks.shift();
          let y = texts_id_snaks.shift();

          Shop.find({'_id':x},function(err,items_founds){
            items_founds.forEach(function(items_qty){
                Snaks_item_prod.push(items_qty.qty);
                unit_price_snaks.push(items_qty.Unit_Price);
            })
            let zx = parseInt(Snaks_item_prod.shift()); 
            let xy = Snaks_item_name.shift();
            let zy = dict_name[xy];
            

            //Email
   
            if (parseInt(zy) - parseInt(y) < 5 ) {
                var value_left = String(parseInt(zy) - parseInt(y)) 
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'rp9541439@gmail.com',
                      pass: 'tsgqdgrgzefwdvwx'
                    }
                  });
                  
                  var mailOptions = {
                    from: 'rp9541439@gmail.com',
                    to: 'ankit9541439@gmail.com',
                    subject: 'Amount Left',
                    text: 'Your Quantity name ='+ " " + xy + " "+ 'Has Only Left '+ " " + value_left + " "+'Quantity',
                    
                    };

                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
            }

            if (parseInt(zy) - parseInt(y) >= 0 ){ 
                var tts = texts_total_snaks.shift() 
                var ttus = unit_price_snaks.shift()
                if ( y === 1){
                    Shop.findByIdAndUpdate(x,{ qty : parseInt(y) + zx , Total : tts*2},function(err,docs){
                        if (!err){
                           text_snaks_id.push(x)
                           res.redirect('/snaks_candy');
                        }
                    })
                }else{
                Shop.findByIdAndUpdate(x,{ qty : parseInt(y) + zx , Total : ttus*y + tts},function(err,docs){
                    if (!err){
                       unit_price_snaks.splice(0,unit_price_snaks.length)
                       text_snaks_id.push(x)
                       res.redirect('/snaks_candy');
                    }
                })
                }
                Item.findOneAndUpdate({ name : xy },{ qty : parseInt(zy) - parseInt(y)},function(err,docs1){
                    if (!err){
                        dict_name[xy] = parseInt(zy) - parseInt(y);
                        console.log('Done');
                }
                });
                } else{
                    res.send('<script> alert("You have only ${zy}")</script>');}  
            });
      }
      }
    
});



let sub_dcount_Snaks_item_total = [];
let early_dscount_total = [];

let list_y_s = [];
let Name_item_qty_s = [];

app.post('/snaks_candy/discount',function(req,res){

    const text45 = req.body.dcount;
    const text46 = req.body.sub_dcount;
    
    try{
        text46.length;
        texts_id_snaks.push(text45);
        var x = text46;
        var Discount_list = [];

        Shop.find({'_id':x},function(err,items_founds){
            items_founds.forEach(function(items_qty){
                Discount_list.push(items_qty.Discount);
            })
           
            xp = Name_item_qty_s.shift().toFixed(2);
            yamont = list_y_s.pop()
            back = xp - (parseInt(yamont)-1)/100*xp;
            list_y_s.push(parseInt(yamont)-1);
            Name_item_qty_s.push(parseInt(xp));
            console.log('Total',back);


            Shop.findByIdAndUpdate(x,{ Discount: parseInt(Discount_list.shift())-1 ,Total :  back} ,function(err,docs){
                if (!err){
                      sub_dcount_Snaks_item_total.splice(0, sub_dcount_Snaks_item_total.length);
                      Discount_list.splice(0, Discount_list.length);
                      text_snaks_id.push(x)
                      res.redirect('/snaks_candy');
                    }
                 })
            })
        
    }

    catch{
    
    texts_id_snaks.push(text45);
    /*Shop.find({},function(err,found){
      found.forEach(function(value){
        if (list_snaks.includes(value.name) === true){
                 sub_dcount_Snaks_item_total.push(value.Total);
                 early_dscount_total.push(value.Total);
                  }
        })
    })*/
    if ( texts_id_snaks.length === 2 ){
        let x = texts_id_snaks.shift();
        let y = texts_id_snaks.shift();
        let Distcount_item_prod = [];
        list_y_s.push(y);
       /* let tp = parseInt(sub_dcount_Snaks_item_total.shift())
        let td = tp - parseInt(y)/100*tp */
    
        Shop.find({'_id':x},function(err,items_founds){
                items_founds.forEach(function(items_qty){
                    Distcount_item_prod.push(items_qty.Discount); 
                    sub_dcount_Snaks_item_total.push(items_qty.Total);
                    Name_item_qty_s.push(items_qty.Total);
                })

                let zx = parseInt(Distcount_item_prod.shift().toFixed(2));
                let tp = sub_dcount_Snaks_item_total.shift().toFixed(2);
                let td = tp - parseInt(y)/100*tp
    

                Shop.findByIdAndUpdate(x,{ Discount : parseInt(y) +zx, Total : td },function(err,docs){
                    if (!err){
                        sub_dcount_Snaks_item_total.splice(0,sub_dcount_Snaks_item_total.length);
                            text_snaks_id.push(x)
                            res.redirect('/snaks_candy');
                              }
                            });
                        });
        
        }
        }
   
});



// Created Button


var texts_created_btn = [];
//var texts_unit_d = [[19.30], [20.00], [12.00],[20.10],[5.00],[9.00]]
var texts_id_created_btn = [];
var texts_total_created_btn = [];
var list_created_btn = []
var text_qty_created_btn = [];
var text_name_created_btn=[];
var text_created_id = [];
//var list_snaks = ["Snickers","KitKat","Almod Milk","Dairy Milk","Butterfinger"]
var dict_create_value = {};
var text_create_id = []
let texts12 = []
let dict_total_value_create = {}
let create_count = 0;

app.get('/created_btn',function(req, res){
    
    Item.find({},function(err,foundbutton){
        foundbutton.forEach(function(item_button){
            if (list_item.includes(item_button.name) === true){
                console.log()
                }else{
    
                    if (list_button.includes(item_button.name)   !== true){
                        list_button.push(item_button.name)
                    }        
                } 
        })
    })

    //Home Page

    Item.find({},function(err,item_found){
        item_found.forEach(function(item_founds){
            dict_name[item_founds.name] = item_founds.qty 
            dict_all[item_founds.name] = item_founds.Unit_Price
        })
    })


    g=text_created_id.shift()
    texts_id_created_btn.splice(0,texts_id_d.length);
    texts_total_created_btn .splice(0,texts_total_created_btn.length);

    Shop.find({'_id':g}, function (err, founditem){   
        var list_total_item = [];
        founditem.forEach(function(eat_items){
            dict_create_value[eat_items.name] = [eat_items.id,eat_items.qty,eat_items.Unit_Price,eat_items.Discount,eat_items.Total]
            dict_total_value_create[eat_items.name] = [eat_items.Total];
        })
        
        console.log('list_new_cell',list_new_cell);

        for (const value of Object.values(dict_total_value_create)) {
            list_total_item.push(parseFloat(value))
        }
        let sum = 0;
        for (let i = 0; i < list_total_item.length; i++) {
            sum += list_total_item[i];
        }
        
        var total_list_price = [];
        dict_total_price['Create'] = sum
        
  
        for (const value of Object.values(dict_total_price)) {
            total_list_price.push(parseFloat(value))
        }
        let sum1 = 0;
        for (let i = 0; i < total_list_price.length; i++) {
            sum1 += total_list_price[i];
        }
        
        let sum2 = 0;
        if ( list_total_sum.length != 0 ){
            for (let i = 0; i < list_total_sum.length; i++) {
                sum2 += list_total_sum[i];
        }
        }

        dict_sum_total['total'] = sum1 ;

        if (list_new_cell.length > 0){
            dict_eta_value = {}
            texts = []
            dict_total_value = {}
            total_list_price = []
            list_total_sum = []
            dict_total_price = {}
        }

        list_new_cell = []

        var total_taxes = 0
        var discount_total = 0
        
        if (list_total_discount.length != 0){
            var value = parseInt(list_total_discount.shift())
            var discount_total = value
            var total_taxes = (sum1-sum2) - value/100 * (sum1-sum2)
        }

       res.render('created_button', { texts1: dict_create_value, texts: texts12 , button_all : list_button , subsum:sum1-sum2 ,total_tax:total_taxes , discount_total:discount_total});   

    }) 
})

//total_discount_create_button

app.post('/total_discount_created_btn',function(req,res){
    const total_discount = req.body.total_dis;
    console.log('Total_discount','=',total_discount);
    list_total_discount.push(total_discount)
    res.redirect('/created_btn') 
})

app.post('/created_btn', function (request, response) {

    const text2 = request.body.Rice;
    const text1 = request.body.item;


    if (texts12.includes(text2) === true) {
        response.send('<script> alert("Already There click on add to add more")</script>');
    } else {
       texts12.push(text2);
       texts_created_btn.push(text2)
        const item_E = new Shop({ 
            name: text2,
            qty: 1,
            Unit_Price:dict_all[text2],
            Discount : 0,
            Total:dict_all[text2]
        });
        item_E.save()
        text_created_id.push(item_E._id)
        create_count+=1
    }
    response.redirect('/created_btn') 

});



app.post('/add/created_btn',function(req,res){
    const text45 = req.body.add;
    const text46 = req.body.sub;


    try{
        let sub_created_btn_item_name = [];
        text46.length;
        texts_id_created_btn.push(text45);
        Shop.find({'_id':text46},function(err,found){
            found.forEach(function(items_created_btn){
                texts_total_created_btn.push(items_created_btn.Total);
                text_qty_created_btn.push(items_created_btn.qty);
                text_name_created_btn.push(items_created_btn.name);
                sub_created_btn_item_name.push(items_created_btn.name);

            })

            var p = text46;
            var r = text_qty_created_btn.shift()-1;
            var snxy = sub_created_btn_item_name.shift();
            var q = dict_all[snxy];
            var snzy = dict_name[snxy];

            Shop.findByIdAndUpdate(p,{ qty : r , Total : texts_total_snaks.shift()-q} ,function(err,docs){
                   if (!err){
                         texts_total_created_btn.splice(0,texts_total_created_btn.length);
                         text_qty_created_btn.splice(0,text_qty_created_btn.length);
                         sub_created_btn_item_name.splice(0,sub_created_btn_item_name.length);
                         text_created_id.push(p)
                         create_count+=1 
                         res.redirect('/created_btn');
                       }
                    })

            Item.findOneAndUpdate({ name : snxy },{ qty : parseInt(snzy) + parseInt(1)},function(err,docs1){
                if (!err){
                        dict_name[snxy] = parseInt(snzy) + parseInt(1);
                         console.log('Done sub');
                         }
            });
   
    })
        
    
    }

    
    catch{
        texts_id_created_btn.push(text45);
        if ( texts_id_created_btn.length === 2 ){
            const created_btn_item_prod = [];
            const created_btn_item_name=[];
            let x = texts_id_created_btn.shift();
            let y = texts_id_created_btn.shift();
    
            Shop.find({'_id':x},function(err,items_founds){
                items_founds.forEach(function(items_qty){
                    created_btn_item_prod.push(items_qty.qty);
                    created_btn_item_name.push(items_qty.name);
                    texts_total_created_btn.push(items_qty.Total);
                    unit_price_create.push(items_qty.Unit_Price)
                })
                let zx = parseInt(created_btn_item_prod.shift());
                let xy = created_btn_item_name.shift();
                let zy = dict_name[xy];
                
                //Email

             
                if (parseInt(zy) - parseInt(y) < 5 ) {
                var value_left = String(parseInt(zy) - parseInt(y)) 
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'rp9541439@gmail.com',
                      pass: 'tsgqdgrgzefwdvwx'
                    }
                  });
                  
                  var mailOptions = {
                    from: 'rp9541439@gmail.com',
                    to: 'ankit9541439@gmail.com',
                    subject: 'Amount Left',
                    text: 'Your Quantity name ='+ " " + xy + " "+ 'Has Only Left '+ " " + value_left + " "+'Quantity',
                    
                    };

                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                }
    
                
                if (parseInt(zy) - parseInt(y) >= 0 ){
                    var ttc = texts_total_created_btn.shift();
                    var ttu_create = unit_price_create.shift()
                    if (y === 1){
                    Shop.findByIdAndUpdate(x,{ qty : parseInt(y) + zx , Total : ttc*2},function(err,docs){
                        if (!err){
                            texts_total_created_btn.splice(0,texts_total_created_btn.length);
                            texts_id_created_btn.push(x)
                            text_created_id.push(x)
                            create_count+=1;
                            res.redirect('/created_btn');
                          }
                        });}else{Shop.findByIdAndUpdate(x,{ qty : parseInt(y) + zx , Total : ttu_create * y + ttc},function(err,docs){
                            if (!err){
                                unit_price_create.splice(0,unit_price_create.length);
                                texts_total_created_btn.splice(0,texts_total_created_btn.length);
                                texts_id_created_btn.push(x)
                                text_created_id.push(x)
                                create_count+=1;
                                res.redirect('/created_btn');
                              }
                            })
                        }

                    Item.findOneAndUpdate({ name : xy },{ qty : parseInt(zy) - parseInt(y)},function(err,docs1){
                        if (!err){
                            dict_name[xy] = parseInt(zy) - parseInt(y);
                            console.log('Done');
                        }
                        });
                } else{
                    res.send('<script> alert("You have only ${zy}")</script>');
                }  
                });
        }
        }
});





let sub_create_Eat_item_total = [];
let early_create_total = [];

let list_create = [];
let Name_create_qty = [];

app.post('/create/discount',function(req,res){

  const text45 = req.body.dcount;
  const text46 = req.body.sub_dcount;
  
  try{
      text46.length;
      var x = text46;
      var Discount_list = [];

      Shop.find({'_id':x},function(err,items_founds){
          items_founds.forEach(function(items_qty){
              Discount_list.push(items_qty.Discount);
          })
          xp = Name_create_qty.shift().toFixed(2);
          yamont = list_create.pop()
          back = xp - (parseInt(yamont)-1)/100*xp;
          list_create.push(parseInt(yamont)-1);
          Name_create_qty.push(parseInt(xp));
          
          Shop.findByIdAndUpdate(x,{ Discount: parseInt(Discount_list.shift())-1 ,Total :  back} ,function(err,docs){
              if (!err){
                    sub_create_Eat_item_total.splice(0, sub_create_Eat_item_total.length);
                    Discount_list.splice(0, Discount_list.length);
                    text_created_id.push(x)
                    create_count+=1;
                    res.redirect('/created_btn');
                  }
               })
          })
      
  }

  catch{
  
    texts_id_created_btn.push(text45);
 
    if ( texts_id_created_btn.length === 2 ){
      let x = texts_id_created_btn.shift();
      let y = texts_id_created_btn.shift();

      list_create.push(y);

      let Distcount_item_prod = [];
  
      Shop.find({'_id':x},function(err,items_founds){
              items_founds.forEach(function(items_qty){
                  Distcount_item_prod.push(items_qty.Discount);
                  sub_create_Eat_item_total.push(items_qty.Total);
                  early_create_total.push(items_qty.Total);
                  Name_create_qty.push(items_qty.Total);
              })
              let tp = sub_create_Eat_item_total.shift().toFixed(2)
              let td = tp - parseInt(y)/100*tp
              let zx = Distcount_item_prod.shift();
              Shop.findByIdAndUpdate(x,{ Discount : parseInt(y) +zx, Total : td },function(err,docs){
                  if (!err){
                          sub_create_Eat_item_total.splice(0,sub_dcount_Eat_item_total.length);
                          text_create_id.push(x)
                          create_count+=1;
                          res.redirect('/created_btn');
                            }
                          });
                      });
      
      }
      }
 
});





//History Page


app.get('/hist', function(req,res) {
    var history_items = [];
    let list_contain_his = [];
    days = weekday[d.getDay()];
    dates = d.toLocaleDateString();
    times = d.toLocaleTimeString();

    Shop.find({}, function (err, founditem) { 
        founditem.forEach(function(current_day){
            All_item=[]
            All_item.push(weekday[d.getDay(current_day.timestamp)]);
            All_item.push(d.toLocaleDateString(current_day.timestamp));
            All_item.push(d.toLocaleTimeString(current_day.timestamp));
            console.log('Time','=',d.toLocaleTimeString(current_day.timestamp));
            history_items.push(All_item); 
            
        })    
        console.log('History','=',history_items);
        res.render( 'history' , {texts1: founditem, day : days, date : dates, time : times});  
    })

});



//Bakery$Kitchen

//var texts_bk=[];
var texts_bk = [];
//var texts_unit = [[19.30], [20.00], [12.00]];
var texts_id_bk = [];
var texts_total_bk = [];
//var list_bk = ["Rice","Cured","Wheate" ];
var text_qty_bk = [];
var text_name_bk=[];
var text_Bk_id = []

let dict_bakery_value = {}
let dict_total_value_bk={}
let dict_type_value_bk=[]
let dict_total_discount_bakery = {}


app.get('/bakery', function (req, res) {
    
    //Home Page

    Item.find({},function(err,item_found){
        item_found.forEach(function(item_founds){
            dict_name[item_founds.name] = item_founds.qty 
            dict_all[item_founds.name] = item_founds.Unit_Price
        })
    })

    g=text_Bk_id.shift()
    texts_id_bk.splice(0,texts_id.length);
    texts_total_bk.splice(0,texts_total.length);

    Shop.find({'_id':g}, function (err, founditem){   
        var list_total_item = [];
        founditem.forEach(function(eat_items){
            eat_items.name.length 
            dict_eta_value[eat_items.name] = [eat_items.id,eat_items.qty,eat_items.Unit_Price,eat_items.Discount,eat_items.Total]
            dict_total_value_bk[eat_items.name] = [eat_items.Total];
        })

        console.log('list_new_cell',list_new_cell);

        for (const value of Object.values(dict_total_value_bk)) {
            list_total_item.push(parseFloat(value))
        }
        let sum = 0;
        
        for (let i = 0; i < list_total_item.length; i++) {
            sum += list_total_item[i];
        }
        
        var total_list_price = [];
        dict_total_price['Bakery'] = sum
        

        for (const value of Object.values(dict_total_price)) {
            total_list_price.push(parseFloat(value))
        }
        let sum1 = 0;
        for (let i = 0; i < total_list_price.length; i++) {
            sum1 += total_list_price[i];
        } 

        let sum2 = 0;
        if ( list_total_sum.length != 0 ){
            for (let i = 0; i < list_total_sum.length; i++) {
                sum2 += list_total_sum[i];
        }
        }

        dict_sum_total['total'] = sum1 ;
        dict_total_discount_bakery['tax'] = 0;
        console.log('dict_sum_total',dict_sum_total)
 
        if (list_new_cell.length > 0){
            dict_eta_value = {}
            texts = []
            dict_total_value = {}
            total_list_price = []
            list_total_sum = []
            dict_total_price = {}
        }

        list_new_cell = []

        var total_taxes = 0
        var discount_total = 0
        
        if (list_total_discount.length != 0){
            var value = parseInt(list_total_discount.shift())
            var discount_total = value
            var total_taxes = (sum1-sum2) - value/100 * (sum1-sum2)
        }

        res.render('bakery_kitchen', { texts1: dict_eta_value, texts: texts , subsum:sum1-sum2, total_tax:total_taxes , discount_total:discount_total});
    })

    /*Shop.find({}, function (err, founditem) {   
        if (!err){            let dict_total_value={};
            let list_total_item=[];
            founditem.forEach(function(items){
                dict_total_value[items.name] =  parseFloat(items.Total) ;           
            })
        for (const value of Object.values(dict_total_value)) {
            list_total_item.push(value)
        }
        let sum = 0;
        for (let i = 0; i < list_total_item.length; i++) {
            sum += list_total_item[i];
        }
        console.log(sum)     
    }
   
    res.render('list1', { texts1: founditem, texts: texts});   

    })*/


});    


//total_discount_bakery_kitchen

app.post('/total_discount_bakery',function(req,res){
    const total_discount = req.body.total_dis;
    console.log('Total_discount','=',total_discount);
    list_total_discount.push(total_discount)
    res.redirect('/bakery') 
})



app.post('/bakery', function (request, response) {

    const text2 = request.body.Rice;
    const text1 = request.body.item;
    //const total_discount = request.body.total_dis

    if (texts.includes(text2) === true) {
        response.send('<script> alert("Already There click on add to add more")</script>');
    } else {
        texts.push(text2);
        text_type_value.push(text2);
        texts_bk.push(text2)
        const item_E = new Shop({
            name: text2,
            qty: 1,
            Unit_Price: dict_all[text2],
            Discount : 0,
            Total: dict_all[text2]
        });
        item_E.save()
        text_Bk_id.push(item_E._id)

        /*const item_E = Shop.findById(request.user.id,function(err,founds){
            if (!err){
               console.log('founds','=',founds)
               founds.name = text2,
               founds.qty =  1,
               founds.Unit_Price =  dict_all[text2],
               founds.Discount = 0,
               founds.Total = dict_all[text2],
               founds.save(function(){
                text_Eat_id.push(founds._id) ; 
                let total_value = request.body.total_dis
                console.log('total_value','=',total_value);
                response.redirect('/');
               })
            } 
        })*/
        
    }
    let total_value = request.body.total_dis;
    var zd = dict_sum_total['total'];
    console.log('total_value','=',total_value);
    dict_total_discount_bakery['tax'] = zd - total_value/100*zd
    console.log('dict_total_discount',dict_total_discount_bakery)
    response.redirect('/bakery');

});



//app.post('/total_discount',function(req,res){
    
   // const total_discount = req.body.total_dis;
   // list_total_discount_eat.push(parseInt(total_discount))
    //console.log('list_total_discount_eat',list_total_discount_eat)
    //res.redirect('/')

//})




app.post('/add/bakery',function(req,res){

    const text45 = req.body.add;
    const text46 = req.body.sub;

    try{
        text46.length;
        let sub_Bakery_item_name = [];
        texts_id_bk.push(text45);
        Shop.find({'_id':text46},function(err,found){
            found.forEach(function(items_bakery){
                texts_total_bk.push(items_bakery.Total);
                text_qty_bk.push(items_bakery.qty);
                text_name_bk.push(items_bakery.name);
                sub_Bakery_item_name.push(items_bakery.name);

            })

            var x = text46;
            var z = text_qty_bk.shift()-1;
            var sxy = sub_Bakery_item_name.shift();
            var szy = dict_name[sxy];
            var y = dict_all[sxy];

            Shop.findByIdAndUpdate(x,{ qty : z , Total : texts_total_bk.shift()-y} ,function(err,docs){
                   if (!err){
                         texts_total_bk.splice(0,texts_total_bk.length);
                         text_qty_bk.splice(0,text_qty_bk.length);
                         sub_Bakery_item_name.splice(0,sub_Bakery_item_name.length);
                         text_Bk_id.push(x)
                         res.redirect('/bakery');
                       }
                    })
            Item.findOneAndUpdate({ name : sxy },{ qty : parseInt(szy) + parseInt(1)},function(err,docs1){
                if (!err){
                            dict_name[sxy] = parseInt(szy) + parseInt(1);
                            console.log('Done sub');
                        }
            });
   
    })
        
    
    }
    catch{
    texts_id_bk.push(text45);
    if ( texts_id_bk.length === 2 ){
        const Bakery_item_prod = [];
        const Bakery_item_name=[];
        let x = texts_id_bk.shift();
        let y = texts_id_bk.shift();

        Shop.find({'_id':x},function(err,items_founds){
            let unit_price_bk = [] ;
            items_founds.forEach(function(items_qty){
                Bakery_item_prod.push(items_qty.qty);
                Bakery_item_name.push(items_qty.name);
                texts_total_bk.push(items_qty.Total)
                unit_price_bk.push(items_qty.Unit_Price)
            })
            let zx = parseInt(Bakery_item_prod.shift());
            let xy = Bakery_item_name.shift();
            let zy = dict_name[xy];
            
            //Email

             
            if (parseInt(zy) - parseInt(y) < 5 ) {
                var value_left = String(parseInt(zy) - parseInt(y)) 
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'rp9541439@gmail.com',
                      pass: 'tsgqdgrgzefwdvwx'
                    }
                  });
                  
                  var mailOptions = {
                    from: 'rp9541439@gmail.com',
                    to: 'ankit9541439@gmail.com',
                    subject: 'Amount Left',
                    text: 'Your Quantity name ='+ " " + xy + " "+ 'Has Only Left '+ " " + value_left + " "+'Quantity',
                    
                    };

                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
            }


            if (parseInt(zy) - parseInt(y) >= 0 ){
                var tt = texts_total_bk.shift()
                var ttu = unit_price_bk.shift()
                console.log('ttu',ttu)
                if (y === 1){Shop.findByIdAndUpdate(x,{ qty : parseInt(y) + zx , Total : tt * 2  },function(err,docs){
                    if (!err){
                       texts_total_bk.splice(0,texts_total.length);
                       text_Bakery_id.push(x)
                       res.redirect('/bakery');
                      }
                    });}else{
                Shop.findByIdAndUpdate(x,{ qty : parseInt(y) + zx , Total : ttu * y + tt },function(err,docs){
                    if (!err){
                       unit_price_bk.splice(0,unit_price_bk.length);
                       texts_total_bk.splice(0,texts_total_bk.length);
                       text_Bakery_id.push(x)
                       res.redirect('/bakery');
                      }
                    });
                }
                Item.findOneAndUpdate({ name : xy },{ qty : parseInt(zy) - parseInt(y)},function(err,docs1){
                    if (!err){
                        dict_name[xy] = parseInt(zy) - parseInt(y);
                    }
                    });
            } else{
                res.send('<script> alert("You have only ${zy}")</script>');
            }  
            });
    }
    }
   
});
 

let sub_dcount_Bakery_item_total = [];
let early_dbcount_total = [];

let list_y_bk = [];
let Name_item_qty_bk = [];

app.post('/bakery/discount',function(req,res){

    const text45 = req.body.dcount;
    const text46 = req.body.sub_dcount;
    
    try{
        text46.length;
        texts_id_bk.push(text45);
        var x = text46;
        var Discount_list = [];

        Shop.find({'_id':x},function(err,items_founds){
            items_founds.forEach(function(items_qty){
                Discount_list.push(items_qty.Discount);
            })

            xp = Name_item_qty_bk.shift().toFixed(2);
            yamont = list_y_bk.pop()
            back = xp - (parseInt(yamont)-1)/100*xp;
            list_y_bk.push(parseInt(yamont)-1);
            Name_item_qty_bk.push(parseInt(xp));
            
            Shop.findByIdAndUpdate(x,{ Discount: parseInt(Discount_list.shift())-1 ,Total :  back} ,function(err,docs){
                if (!err){
                      sub_dcount_Bakery_item_total.splice(0, sub_dcount_Eat_item_total.length);
                      Discount_list.splice(0, Discount_list.length);
                      text_Bk_id.push(x)
                      res.redirect('/bakery');
                    }
                 })
            })
        
    }

    catch{
    
    texts_id_bk.push(text45);
   
    if ( texts_id_bk.length === 2 ){
        let x = texts_id_bk.shift();
        let y = texts_id_bk.shift();

        list_y_bk.push(y);

        /*Shop.find({'_id':x},function(err,found){
            found.forEach(function(value){
                  sub_dcount_Eat_item_total.push(value.Total);
                  early_dcount_total.push(value.Total);
              })
            console.log('inside',sub_dcount_Eat_item_total);
          })

        
        let tp = parseInt(sub_dcount_Eat_item_total.shift())
        let td = tp - parseInt(y)/100*tp*/

        let Distcount_item_prod = [];
    
        Shop.find({'_id':x},function(err,items_founds){
                items_founds.forEach(function(items_qty){
                    Distcount_item_prod.push(items_qty.Discount);
                    sub_dcount_Bakery_item_total.push(items_qty.Total);
                    Name_item_qty_bk.push(items_qty.Total);
                })
                let tp = sub_dcount_Bakery_item_total.shift().toFixed(2)
                let td = tp - parseInt(y)/100*tp
                let zx = Distcount_item_prod.shift();
                Shop.findByIdAndUpdate(x,{ Discount : parseInt(y) +zx, Total : td },function(err,docs){
                    if (!err){
                            sub_dcount_Bakery_item_total.splice(0,sub_dcount_Eat_item_total.length);
                            text_Bk_id.push(x)
                            res.redirect('/bakery');
                              }
                            });
                        });
        
        }
        }
   
});


/*app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;

   //Shop.find({'_id':checkedItemId},function(err,founditem){
      //  if (!err){
         //   founditem.forEach(function(value){
            //  tind = texts.indexOf(value.name);
          //    delete texts[tind];
            //  delete dict_total_value[value.name];
            //  delete dict_eta_value[value.name];
           // })
      //  }

        Shop.findByIdAndRemove(checkedItemId, function(err){
            if (!err) {
              console.log("Successfully deleted checked item.");
               res.redirect("/");
            }
        })

     // });

  
  });*/

//Delete Item


app.post("/customer/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    Shop.find({'_id':checkedItemId} , function(err,found){
        if (!err){
            found.forEach(function(items){
                index_of_item = texts.indexOf(items.name)
                rm = texts.pop(index_of_item)
                delete dict_eta_value[items.name]
                list_total_sum.push(items.Unit_Price)
            })
        }
    })
    
    Shop.findByIdAndRemove(checkedItemId, function(err){
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        }
      });
  
  });






//Graph
//all name save in db

var dict={}
const list_contain=[]
const list_name_all=[]
const list_qty_all=[]
const A = []

app.get('/map',function(request,response){

    Item.find({},function(err,founds){
        if (!err){
        founds.forEach(function(items){
            if (list_contain.includes(items.name) !== true){
                list_contain.push(items.name)
                Item.find({"name":items.name},function(err,found){
                    if (!err){
                        found.forEach(function(item){
                            A.push(item.qty)
                        })
                    }
                var sum = 0;
                for (var i = 0; i < A.length; i++) {
                     sum += A[i];
                    } 
                list_qty_all.push(sum);
                A.splice(0,A.length);
                })      
            }
        })
        }  
    })
    response.render('map_plot' , { data_name:list_contain , data_qty:list_qty_all });
})

app.post('/New_cell',function(request,response){
    let list_new_cell=[]
    list_new_cell.push(request.body.new_cell);
    if (list_new_cell.length>=1){
        dict_total_price = []
         dict_eta_value = {}
         dict_total_value={}
        response.redirect(request.get('referer'));

    }
}) 

/*app.post('/total_dir',function(req,res){
    let total_value = req.body.total_dis
    console.log('total_value','=',total_value)
})*/




}




//Registration User


const registerSchema = new mongoose.Schema ({
    email: String,
    password: String,
    
    //name: String,
    //qty: Number,
    //Unit_Price: Number,
    //Discount:Number,
    //Total: Number,
    //timestamp: { type: Date, default: Date.now}
  });



registerSchema.plugin(passportLocalMongoose);


//registerSchema.plugin(encrypt,{secret: process.env.SECRET , encryptedFields:['password'] });


const Register =  new mongoose.model('Register',registerSchema)

//const Register =  mongoose.model('Register',registerSchema)

passport.use(Register.createStrategy());

passport.serializeUser(Register.serializeUser());

passport.deserializeUser(Register.deserializeUser());




app.get('/register',function(req,res){
    res.render("register");
});

app.get('/login',function(req,res){
    res.render("login");
});


app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/register");
  });

app.post('/register',function(req,res){
    Register.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/home");
          });
        }
      });
});

app.post('/login',function(req,res){
    const user = new Register({
        username: req.body.username,
        password: req.body.password
      });
    
      req.login(user, function(err){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/home");
          });
        }
      });
    
});






/*app.get('/register',function(req,res){
    res.render("register");
});

app.get('/login',function(req,res){
    res.render("login");
});


app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/register");
  });

app.post('/register',function(req,res){
    Shop.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/home");
          });
        }
      });
});

app.post('/login',function(req,res){
    const user = new Shop({
        username: req.body.username,
        password: req.body.password
      });
    
      req.login(user, function(err){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/home");
          });
        }
      });
    
});  */


//Frot Page

app.get('/front',function(req,res){
    res.render('front_page')
})





app.listen(3000); 