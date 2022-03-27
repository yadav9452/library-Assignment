
const express=require("express");
const app=express();
const mongoose=require("mongoose");

app.use(express.json());
const connectLib=()=>{
    return mongoose.connect("mongodb+srv://yadav9452:12345@cluster0.zup5e.mongodb.net/Cluster0?retryWrites=true&w=majority");
}

// USER SCHEMA............................................................................................

const userSchema=new mongoose.Schema({
    Name:{type:String,required:true},  
   
},
{
    versionKey:false,
    timestamps:true,
});

const User=mongoose.model("user",userSchema);

// Section is Parent and book is child
// SECTION SCHEMA............................................................................................

const sectionSchema=new mongoose.Schema({
    name:{type:String,required:true},  
},
{
    versionKey:false,
    timestamps:true,
});
const Section=mongoose.model("section",sectionSchema);

// AUTHOR SCHEMA.......................................................................

const authorSchema=new mongoose.Schema({
    userId:{

        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    }}
    ,{
        versionKey:false,
        timestamps:true,
    });
    const Author=mongoose.model("author",authorSchema);

// BOOK SCHEMA/..........................................................................................

const bookSchema=new mongoose.Schema({
    name:{type:String,required:true},
    body:{type:String},
    sectionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"section",
        required:true,
    },
    authorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"author",
        required:true,
    }}
    ,{
        versionKey:false,
        timestamps:true,
    });

    const Book=mongoose.model("book",bookSchema);



// Book-Author Schema as it is many to many relation.....................................................................

const bookAuthorSchema=new mongoose.Schema({
    bookId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"book",
        required:true,
    },authorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"author",
        required:true,
    },sectionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"section",
        required:true,
    } }
    ,{
        versionKey:false,
        timestamps:true,
    });

    const BookAuthor=mongoose.model("bookAuthor",bookAuthorSchema);

//   CheckedOut Schema ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, 

const checkedOutSchema=new mongoose.Schema({
    checkedOutTime:{type:String, default:null},
    checkedInTime:{type:String,default:null},
    bookId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"book",
        required:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    }}
    ,{
        versionKey:false,
        timestamps:true,
    });
    const CheckedOut=mongoose.model("checkedout",checkedOutSchema);

    // USER CRUD.............................................................................................
    app.get("/user", async (req,res)=>{
        const user = await User.find().lean().exec()
        res.status(200).send({user})
    });
    app.post("/user", async (req, res)=>{
        const user = await User.create(req.body)
    
        return res.status(201).send({user})
    });
    
    app.get("/user/:id", async(req, res)=>{
        const user = await User.findById(req.params.id).lean().exec();
        res.status(200).send({user})
    });
    

// CRUD SECTION.................................................................................................

    app.post("/section", async (req, res)=>{
        const sec = await Section.create(req.body)
    
        return res.status(201).send({sec})
    });
    
    app.get("/section", async (req,res)=>{
        const sec = await Section.find().lean().exec();
        res.status(200).send({sec})
    });

//  CRUD for books/...................................................................................
    app.post("/book", async (req, res)=>{
        const book = await Book.create(req.body)
    
        return res.status(201).send({book})
    });
    
    app.get("/book", async (req,res)=>{
        const book = await Book.find({}).populate().populate().lean().exec()
        res.status(200).send({book})
    });
    
    
    
//    CRUD for author/....................................................................................
    
    
    app.post("/author", async (req, res)=>{
        const author = await Author.create(req.body)
    
        return res.status(201).send({author})
    });
    
    app.get("/author", async (req,res)=>{
        const author = await Author.find().lean().exec();
        res.status(200).send({author})
    });
    
    
    //CRUD book Author/............................................................................................
    
    app.post("/bookAuthor", async(req,res)=>{
        const bookAuthor = await BookAuthor.create(req.body);
        return res.status(201).send({bookAuthor})
    })
    app.get("/bookAuthor", async (req,res)=>{
        const bookAuthor = await BookAuthor.find().populate("authorId").populate("bookId").lean().exec();
        res.status(200).send({bookAuthor})
    });
    
   
    
    // All books written by an Author/..............................................................................
    
    app.get("/bookAuthor/:id", async(req, res)=>{
        const match = await BookAuthor.find({authorId:req.params.id}).lean().populate("bookId").exec();
        res.send(match)
    })
     
    // All books by one author in a section..................................................................................

    app.get("/book/:author_id/:section_id", async(req, res)=>{
        const match = await Book.find({ authorId:req.params.author_id,sectionId:req.params.id}).lean().populate("bookId").exec();
        res.send(match)
    });

    
   // All books in a section..................................................................................

    app.get("/book/:id", async(req, res)=>{
        const match = await Book.find({sectionId:req.params.id}).lean().populate("secionId").exec();
        res.send(match);
    })
    // CHECKED OUT ................................
    app.get("/checkedout", async (req,res)=>{
        const check = await CheckedOut.find().lean().exec();
        res.status(200).send({check})
    });

    app.post("/checkedout", async (req, res)=>{
        const check = await CheckedOut.create(req.body)
    
        return res.status(201).send({check});
    });
    // All books that are not checked out............................................
    app.get("/checkedout/:id", async(req, res)=>{
        const match = await CheckedOut.find({bookId:req.params.id}).lean().populate({
            path:"bookId", select:["name"],populate:{path:"sectionId",select:["name"]}
        }).exec();
        res.send(match)
    })

app.listen(5000,async()=>{
    try {
        await connectLib();
        console.log("Listening to port 5000");
    } catch (error) {
        console.log("Error",error);
    }
})