const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"public")));

async function main(){
    await mongoose.connect(MONGO_URL);
}

main().then(()=>{
    console.log("connected to DB");
}).catch(e => console.log(e));

app.get("/",(req,res)=>{
    res.send("Working");
});

//index Route

app.get("/listings",wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//new Route
app.get("/listings/new",wrapAsync((req,res)=>{
    res.render("listings/new.ejs");
}));

//Create Route
app.post("/listings",wrapAsync(async(req,res)=>{
    const {listing} = req.body;
      if (!listing.image || !listing.image.url || listing.image.url.trim() === "") {
       delete listing.image;
    }
    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
}));

//edit Route
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//update Route
app.put("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//show Route
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

//delete Route
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"Page Not Found!"));
// });

app.use((err,req,res,next)=>{
    let {statusCode = 500,message = "something is wrong"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080,()=>{
    console.log("port is listing at 8080");
});


// app.get("/testListing",async (req,res)=>{
//     let smapleList = new Listing ({
//         title : "Villa",
//         description : "special villa",
//         price : 1200,
//         location : "Goa",
//         country : "India",
//     });
//     await smapleList.save();
//     console.log("Sample is saved");
//     res.send("200 testing");
// })