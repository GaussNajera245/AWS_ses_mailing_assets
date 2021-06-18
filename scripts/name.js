exports = async function(changeEvent) {
  const moment = require("moment-timezone");
  const mongo = context.services.get("Cluster0");
  const ses = context.services.get('temp_notifications').ses("us-east-1");
    
  
  const { fullDocument } = changeEvent;
  const { elevatedBreathAlcoholLevel, _id, rfid, equipmentId, createdAt } = fullDocument;
  const companyId = fullDocument.companyId.toString();
  
  const companies = mongo.db("CTi").collection("companies");
  const currentCompany = await companies.findOne({ _id: BSON.ObjectId(companyId) }, {notificationAlcoholEmails:1});
    console.log(JSON.stringify(currentCompany));
  const { notificationAlcoholEmails } = currentCompany;

  if( notificationAlcoholEmails.length != 0 && elevatedBreathAlcoholLevel === true ){

    const employees = mongo.db("CTi").collection("employees");
    const currentEmployee = await employees.findOne({ rfid: rfid, companyId: BSON.ObjectId(companyId) });
      console.log(JSON.stringify(currentEmployee));
    
    const newCreate = moment.tz( createdAt, 'America/Mexico_City');
    const ses = context.services.get('temp_notifications').ses("us-east-1");
    const A = Date().slice(' ');
       console.log('s', Date());
    const data = `{ "name": "${currentEmployee.fullName}", "date": "${A[2]}/${A[1]}/${A[3]}","equipmentId":"${equipmentId}","UTC":"18:40:21.543Z","rfid":"${rfid}", "localHour":"${newCreate}"}`
 
      const result = ses.SendTemplatedEmail({
        Source: "Alcoholimetria Cardiotrack <seara.health@gmail.com>",
        Template: "ThumbsDown",
        ConfigurationSetName: "ConfigSetI",
        Destination: {
          ToAddresses: notificationAlcoholEmails
        },
        TemplateData: data
      });

    console.log(JSON.stringify(result));
  }
};