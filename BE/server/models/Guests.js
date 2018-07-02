var db=require('../dbconnection');

var Guests={

getCurrentDateTime:function(){
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
},

getAllGuests:function(callback){
return db.query("SELECT * FROM guests",callback);
},
getGuestByCode:function(code,callback){
    return db.query("SELECT * FROM guests WHERE rsvp_code=?",[code],callback);
},
setRSVPstatus:function(RSVPstatus,codes,callback){
    for(let i = 0; i < codes.length; i++){
        return db.query(
            "UPDATE guests SET rsvp_status=?,date_last_updated=? WHERE rsvp_code=?",
            [
                RSVPstatus,
                this.getCurrentDateTime(),
                code
            ],
            callback
        );
    }
},
setRSVP:function(RSVPstatus, updatedBy, notes, codeToUpdate, callback){
    return db.query(
        "UPDATE guests " +
        "SET rsvp_status=?, " +
        "date_last_updated=?, " +
        "updated_by=?, " +
        "notes=? " +
        "WHERE rsvp_code=?",
        [
            RSVPstatus,
            this.getCurrentDateTime(),
            updatedBy,
            notes,
            codeToUpdate,
        ],
        callback
    );
},
getPartner:function(code, callback){
    return db.query(
        "SELECT plus_one_name " +
        "FROM guests " +
        "WHERE rsvp_code=?",
        [
            code
        ],
        callback
    );
},
addPartner:function(partnerName, code, callback){
    return db.query(
        "UPDATE guests " +
        "SET plus_one_name=? " +
        "WHERE rsvp_code=? AND plus_one = 'true'",
        [
            partnerName,
            code
        ],
        callback
    );
},
// getTaskById:function(id,callback){
//
//     return db.query("select * from task where Id=?",[id],callback);
// },
// addTask:function(Task,callback){
//    console.log("inside service");
//    console.log(Task.Id);
// return db.query("Insert into task values(?,?,?)",[Task.Id,Task.Title,Task.Status],callback);
// //return db.query("insert into task(Id,Title,Status) values(?,?,?)",[Task1.Id,Task1.Title,Task1.Status],callback);
// },
// deleteTask:function(id,callback){
//     return db.query("delete from task where Id=?",[id],callback);
// },
// updateTask:function(id,Task,callback){
//     return  db.query("update task set Title=?,Status=? where Id=?",[Task.Title,Task.Status,id],callback);
// },
// deleteAll:function(item,callback){
//
// var delarr=[];
//    for(i=0;i<item.length;i++){
//
//        delarr[i]=item[i].Id;
//    }
//    return db.query("delete from task where Id in (?)",[delarr],callback);
// }
};
module.exports=Guests;