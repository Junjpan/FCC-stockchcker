var mongoose=require('mongoose');

var StockSchema=new mongoose.Schema({
    "stock":String,
    "price":String,
    "likes":[String],
})

module.exports=mongoose.model('Stock',StockSchema);

