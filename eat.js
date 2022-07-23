const express = require('express');
const app = express();

module.exports.Eat_func = Eat_func;



function Eat_func(){

// eat 
var texts_e=[];
var texts = [];
//var texts_unit = [[19.30], [20.00], [12.00]];
var texts_id = [];
var texts_total = [];
var list_e = ["Rice","Cured","Wheate" ];
var text_qty_e = [];
var text_name_e=[];
var text_Eat_id=[]

// Total Sum

let list_total_sum = []

let dict_total_price = []



let dict_eta_value = {}
let dict_total_value={}
let dict_type_value=[]
let dict_total_discount_eat = {}




//app.post('/total_discount',function(req,res){
  //  const total_discount = req.body.total_dis;
    //list_total_discount_eat.push(parseInt(total_discount))
   // console.log('list_total_discount_eat',list_total_discount_eat)
   // res.redirect('/') 
//})




app.post('/add',function(req,res){
    const text45 = req.body.add;
    const text46 = req.body.sub;
    console.log('text45','=',text45)

    
    try{
        text46.length;
        console.log('texts46','=',texts46)
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
    if ( texts_id.length === 2 ){
        const Eat_item_prod = [];
        const Eat_item_name=[];
        let x = texts_id.shift();
        let y = texts_id.shift();
        console.log('x','=',x);
        console.log('y','=',y);

        Shop.find({'id':x},function(err,items_founds){
            console.log('items_found',items_founds)
            let unit_price = [] ;
            console.log('x1','=',x);
            console.log('y1','=',y);
            console.log('items_founds',items_founds);
            items_founds.forEach(function(items_qty){
                Eat_item_prod.push(items_qty.qty);
                console.log('x2','=',x);
                console.log('y2','=',y);
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
}