/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var Stock=require("../models/Stock")

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.beforeAll((done)=>{
   Stock.remove({},(err)=>{
     if(err){throw err}
     console.log("delete all stock from DB")
     done();
   });


  })
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status,200);
          assert.property(res.body,"stockData");
          assert.property(res.body.stockData,"stock");
          assert.property(res.body.stockData,"price");
          assert.property(res.body.stockData,"likes");
          assert.equal(res.body.stockData.stock,"GOOG");
          assert.isString(res.body.stockData.price);
          assert.isNumber(res.body.stockData.likes);
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get("/api/stock-prices")
        .query({stock:"goog",
               like:true})
        .end(function(err,res){
          assert.equal(res.status,200)
          assert.property(res.body,"stockData");
          assert.property(res.body.stockData,"stock");
          assert.property(res.body.stockData,"price");
          assert.property(res.body.stockData,"likes");
          assert.equal(res.body.stockData.stock,"GOOG");
          assert.strictEqual(res.body.stockData.likes,1);
          assert.isString(res.body.stockData.price);
          assert.isNumber(res.body.stockData.likes);
          done();
        })       

        
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get("/api/stock-prices")
        .query({stock:"goog",
               like:true})
        .end(function(err,res){
          assert.equal(res.status,200)
          assert.property(res.body,"stockData");
          assert.property(res.body.stockData,"stock");
          assert.property(res.body.stockData,"price");
          assert.property(res.body.stockData,"likes");
          assert.equal(res.body.stockData.stock,"GOOG");
          assert.strictEqual(res.body.stockData.likes,1);
          assert.isString(res.body.stockData.price);
          assert.isNumber(res.body.stockData.likes);
          done();
        })       
        
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get("/api/stock-prices")
        .query({stock:["goog","msft"]})
        .end(function(err,res){
          assert.equal(res.status,200)
          assert.property(res.body,"stockData");
          assert.isArray(res.body.stockData);
          for (let item of res.body.stockData){
            assert.property(item,"stock");
            assert.isString(item.stock);
            assert.property(item,"price");
            assert.isString(item.price);
            assert.property(item,"rel_likes");
            assert.isNumber(item.rel_likes);
         
            switch(item.stock){
              case "GOOG":
              assert.strictEqual(item.rel_likes,1);
              break;
              case "MSFT":
              assert.strictEqual(item.rel_likes,-1);
              break;
            }
          }
          done();
        })   
        
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get("/api/stock-prices")
        .query({stock:["goog","msft"],
               like:true})
        .end(function(err,res){
          assert.equal(res.status,200)
          assert.property(res.body,"stockData");
          assert.isArray(res.body.stockData);
          for (let item of res.body.stockData){
            assert.property(item,"stock");
            assert.isString(item.stock);
            assert.property(item,"price");
            assert.isString(item.price);
            assert.property(item,"rel_likes");
            assert.isNumber(item.rel_likes);
         
            switch(item.stock){
              case "GOOG":
              assert.strictEqual(item.rel_likes,0);
              break;
              case "MSFT":
              assert.strictEqual(item.rel_likes,0);
              break;
            }
          }
          done();
        })


        
      });
      
    });

});
