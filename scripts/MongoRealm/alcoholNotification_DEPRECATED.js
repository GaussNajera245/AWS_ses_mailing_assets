exports = async function(changeEvent) {
  const { fullDocument } = changeEvent;
  const { elevatedBreathAlcoholLevel, _id, rfid } = fullDocument;
  
  const companyId = fullDocument.companyId.toString();
  const mongo = context.services.get("Cluster0");
  
    const alcos = mongo.db("CTi").collection("breathalcohols");
    const ses = context.services.get('temp_notifications').ses("us-east-1");
    
      const companies = mongo.db("CTi").collection("companies");
      const currentCompany = await companies.findOne({ _id: BSON.ObjectId(companyId) }, {notificationAlcoholEmails:1});
      console.log(JSON.stringify(currentCompany));
      const notificationAlcoholEmails = currentCompany.notificationAlcoholEmails;
    
    if( notificationAlcoholEmails.length != 0 && elevatedBreathAlcoholLevel === true ){
    
      console.log(JSON.stringify(notificationAlcoholEmails))
      
      const employees = mongo.db("CTi").collection("employees");
      const currentEmployee = await employees.findOne({ rfid: rfid, companyId: BSON.ObjectId(companyId) });
      console.log(JSON.stringify(currentEmployee))
      
      
      const BCCmails = ["1664859gustavonajera@gmail.com", "operaciones@gruposeara.com",  "ces@gruposeara.com"];

      var ses_mail = "From: Notificaciones Cardiotrack - Alcoholimetria <seara.health@gmail.com>\n";
      ses_mail += "To: " + notificationAlcoholEmails + "\n";
      // ses_mail += "Bcc: " + BCCmails + "\n";
      ses_mail += "Subject: " + currentEmployee.fullName + " probo positivo de alcohol en aliento." + "\n";
      ses_mail += "MIME-Version: 1.0\n";
      ses_mail += "Content-Type: multipart/mixed; boundary=\"NextPart\"\n\n";
      ses_mail += "--NextPart\n";
      ses_mail += "Content-Type: text/html\n\n";
      ses_mail += `<h3 style="display:inline">${currentEmployee.companyName}</h3>`;
      ses_mail += "<h4>Esta persona probo positivo de alcohol en aliento.</h4> ";
      ses_mail += `<b>Empleado:</b> ${currentEmployee.fullName},&nbsp;&nbsp;<b>CompanyEmployeeId:</b> ${currentEmployee.companyEmployeeId} <br>`;
      ses_mail += `<b>RFID:</b> ${rfid},&nbsp;&nbsp;<b>Empleado Externo:</b> ${currentEmployee.outsourcedEmployee} <br><br>`;  
      ses_mail += "\n\n";
      ses_mail += "--NextPart--";
      
        const result = ses.SendRawEmail({
        Source: "seara.health@gmail.com",
        RawMessage: { Data: ses_mail }
        });

      console.log(JSON.stringify(currentEmployee));
    }
};