const { parse } = require("dotenv");
const events = require("../models/events.model");
const UploaderMiddleware = require("../services/uploader/uploader");

const addEvents = async (req, res) => {

    try {

        const {photo} = req.body

        const eventsRef = await events.create(req.body);
        
        if (Object.keys(photo).length) {
            
            await UploaderMiddleware(photo).then( async response => {

                eventsRef.photo = response.secure_url
                await eventsRef.save();
    
            })
        }

        res.status(200).json({ status : "ok", message : "News added successfully..."});
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const getAllEvents = async (req, res) => {

    const page = parseInt(req.params.page || 0);
    const limit = 20;
    const topic = (req.params.topic || "all")
    
    
    try {

        if (topic !== "all") {

            let count = await events.find( { categories : topic } ).count()
            
            const eventsRef = await events.find( { categories : topic } ).limit(limit).skip(page * limit);

            res.status(200).json({ status : "ok", message : "Fetched all data successfully...", data : eventsRef, length : count })


        } else {

            let count = await events.estimatedDocumentCount();
            const eventsRef = await events.find({}).sort({'date': -1}).limit(limit).skip(page * limit)

            res.status(200).json({ status : "ok", message : "Fetched all data successfully...", data : eventsRef, length : count })
        }
        
    }
     
    catch (error) {

        res.status(500).json({message : error.message});
        
    }
}

const getEventsForMda = async (req, res) => {

    try {

        const { id } = req.params;

        const eventsRef = await events.find({mda : id});
        res.status(200).json({ status : "ok", message : "Fetched all data successfully...", data : await eventsRef })
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const getSingleEvents = async (req, res) => {

    try {

        const { id } = req.params;

        const eventsRef = await events.findById(id);
        res.status(200).json({ status : "ok", message : "Fetched single data successfully...", data : await eventsRef })
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }

}

const updateEvents = async (req, res) => {

    try {

        const { id } = req.params;

        const eventsRef = await events.findByIdAndUpdate(id, req.body);

        if (req.body.photo.data !== undefined) {
            
            await UploaderMiddleware(req.body.photo).then( async response => {

                eventsRef.photo = response.secure_url
                await eventsRef.save();
    
            })
        }

        if(eventsRef) {

            res.status(200).json({ status : "ok", message : "News item Updated successfully...", data : eventsRef })

        } else{

            res.status(404).json({ status : "error", message : "News not found..." })

        }
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const addRsvp = async ( req, res ) => {


    const { id } = req.params;
    const { email } = req.body;

    const eventDoc = await events.findById(id);
    
    if ( eventDoc ){

        const eventRsvp = eventDoc.attendees.filter( e => e.email === email );

        if ( !eventRsvp.length ) {

            try {

                const eventsRef = await events.findByIdAndUpdate( id, { $push: { attendees : req.body } } );
        
                if(eventsRef) {
        
                    res.status(200).json({ status : "ok", message : "You have registered for this event successfully!", data : eventsRef })
        
                } else{
        
                    res.status(404).json({ status : "error", message : "Event not found..." })
        
                }
                
            } 
            catch (error) {
        
                res.status(500).json({message : error.message})
                
            }

        } else {

            res.status(200).json( { status : "bad", message : "This email has already been registered!" } )

        }

    } else {

        res.status(404).json( { status : "bad", message : "This event doesnt exist" } )

    }

    

}

const deleteEvent = async (req, res) => {    

    try {

        const { id } = req.params;

        const eventsRef = await events.findByIdAndDelete(id);

        if(eventsRef) {

            res.status(200).json({ status : "ok", message : "News deleted successfully..." })

        } else{

            res.status(404).json({ status : "error", message : "Category not found..." })

        }
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

module.exports = {

    deleteEvent,
    updateEvents,
    addEvents,
    getAllEvents,
    getSingleEvents,
    getEventsForMda,
    addRsvp

}