/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
//var MongoClient = require('mongodb');
var mongoose = require('mongoose');
var Stock = require('../models/Stock');
var fetch = require('node-fetch');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, db) => {
  if (err) throw err;
  console.log("Connected to MongoDB...")
})

module.exports = function (app) {
  var stockApiUrl = "https://api.iextrading.com/1.0/stock/";

  function getStockData(symbol, like, IP, res) {
    return new Promise((resolve, reject) => {
      fetch(stockApiUrl + symbol + "/quote")
        .then(function (res) {
          return res.json();
        })//res.json() returns a promise
        .then((data) => {
          //console.log(data);
          var query = { "stock": symbol };
          Stock.findOne(query, (err, stock) => {

            if (stock === null) {
              var newStock = new Stock();
              newStock.stock = symbol;
              newStock.price = data.latestPrice;
              newStock.likes = like ? IP : [];
              //console.log(newStock);
              newStock.save((err, ST) => {
                if (err) { console.log(err) }
                resolve({
                  "stock": ST.stock,
                  "price": ST.price,
                  "likes": ST.likes.length
                });
              });

            } else {// if stock is in the DB already then update the stock info

              var likeUpdated = like ? IP : null;

              function AddLikeIp(IP) {
                var IPLikeList = stock.likes;
                if (IPLikeList.indexOf(IP) === -1) {
                  stock.likes.push(IP);
                  return stock.likes;
                }
                return stock.likes
              }

              var likesUpdatedIpArray = (likeUpdated != null) ? AddLikeIp(IP) : stock.likes;
              var StockUpdate = {
                "price": data.latestPrice,
                "likes": likesUpdatedIpArray
              };
              //console.log(StockUpdate);

              Stock.updateOne(query, { $set: StockUpdate }, (err, updateStock) => {
                if (err) { console.log(err) }
                console.log("sucessfully updated");
                //stock has been updated
                resolve({
                  "stock": stock.stock,
                  "price": stock.price,
                  "likes": stock.likes.length
                });
              })

            }

          })
        })
        .catch((err) => {
          if (err) {
            console.log("Cloud not find stock symbol");
            res.send("Cloud not find stock symbol");
          }
        })

    })

  }


  app.route('/api/stock-prices')
    .get(function (req, res) {
      var ip = (req.connection.remoteAddress || req.socket.remoteAddress || req.header['x-forwarded-for'] || req.connection.socket.remoteAddress).split(',')[0];
      var like = req.query.like;
      // console.log(ip, like);
      var symbol = req.query.stock;
      //console.log(typeof(symbol));

      //if there are no stock in query,return all stocks in DB
      if (!symbol) {
        Stock.find({}, (err, stock) => {
          if (err) { return res.redirect('/') }
          return res.json({ "allStock": stock })
        })
      }

      //if there are more than 2 stock query, 

      if (typeof (symbol) === "object" && symbol.length > 2) {
        res.send("Please request no more than two stocks at a time");
      }

      //if only one single stock query was entered
      if (typeof (symbol) === 'string') {
        var symbol1=symbol.toUpperCase();
        getStockData(symbol1, like, ip, res).then(stock=>
          {var stockdata={"stockData":stock}
            return res.json(stockdata)})

      }

      // if there are two stock query was entered
      if (typeof (symbol) === 'object' && symbol.length === 2) {
       var symbol1=symbol[0].toUpperCase();
       var symbol2=symbol[1].toUpperCase();
        getStockData(symbol1, like, ip, res).then(stock1 => {
          console.log(stock1)
        var stockdata={"stockData":[]};
        var tempStock1={};
        var tempStock2={};
        var like1,like2;
        like1=stock1.likes
        tempStock1.stock=stock1.stock;
        tempStock1.price=stock1.price;
        tempStock1.rel_likes=like1;
        stockdata.stockData.push(tempStock1);
          
       console.log(stockdata);

       
        getStockData(symbol2, like, ip, res).then(stock2 => {
         console.log(stock2)
         like2=stock2.likes;
         stockdata.stockData[0].rel_likes=like1-like2;
         tempStock2.stock=stock2.stock;
         tempStock2.price=stock2.price;
         tempStock2.rel_likes=like2-like1;


         stockdata.stockData.push(tempStock2);
         return res.json(stockdata);
        }).catch(err=>{console.log(err)})


      }).catch(err=>{console.log(err)})

      }

    });

}
