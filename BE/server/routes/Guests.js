var express = require('express');
var router = express.Router();
var Guests=require('../models/Guests');


router.get('/',function(req,res,next){
    Guests.getAllGuests(function(err,rows){
        if(err)
        {
            res.json(err);
        }
        else
        {
            res.json(rows);
        }
    });
});

router.get('/:code',function(req,res,next){
    if(req.params.code){
        Guests.getGuestByCode(req.params.code,function(err,rows){
            if(err)
            {
                res.json(err);
            }
            else{
                res.json(rows);
            }
        });
    }
    else{
        res.json(null);
    }
});
router.post('/:code',function(req,res,next){
    if(req.body && req.body.rsvps && req.params.code){
        let len = req.body.rsvps.length,
            rsvps = req.body.rsvps,
            updatedBy = req.params.code;

        for(let i =0; i < len; i++){
            let RSVPstatus = rsvps[i].status,
                notes = rsvps[i].notes,
                codeToUpdate = rsvps[i].code;

            Guests.setRSVP(RSVPstatus, updatedBy, notes, codeToUpdate, function(err,rows){
                if(err)
                    res.json(err);
                if(i + 1 === len)
                    res.json(rows);
            });
        }
    }
});
router.get('/:code/partner',function (req,res,next) {
    Guests.getPartner(req.params.code,function (err,result) {
        if(err)
            res.json(err);
        else
            res.json(result);
    })
});
router.post('/:code/partner',function (req,res,next) {
   Guests.addPartner(req.body.name,req.params.code,function (err,result) {
       if(err)
           res.json(err);
       else{
           // if(result && result.changedRows)
               res.json('Ons sien uit om vir U en '+req.body.name+' by die troue te sien!');
           // else
           //      res.json(result);
       }
   })
});
module.exports=router;