/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N'],

    function (N) {


        const { log, runtime, record, search, email } = N;
        const { serverWidget } = N.ui;

        const ALUMNO_RECORD = {
            Fields: {
                'name': 'name',
                'firstname': 'custrecord_ri_alu_first',
                'lastname': 'custrecord_ri_alu_last',
                'email': 'custrecordri_alu_email',
                'phone': 'custrecord_ri_alu_telefono'
            }
        }

        function makeMandatoryField(form, id) {
            form.getField(id).isMandatory = true;
        }

        function disableNameField(form) {
            let field = form.getField('name');
            field.isMandatory = false;
            field.updateDisplayType({ displayType: 'DISABLED' })
        }

        function hideInactiveField(form) {
            form.getField('isinactive').updateDisplayType({ displayType: 'HIDDEN' })
        }


        function beforeLoad(scriptContext) {

            let { form } = scriptContext;

            hideInactiveField(form);

            makeMandatoryField(form, ALUMNO_RECORD.Fields.firstname);
            makeMandatoryField(form, ALUMNO_RECORD.Fields.lastname);
            makeMandatoryField(form, ALUMNO_RECORD.Fields.email);
            makeMandatoryField(form, ALUMNO_RECORD.Fields.phone);

            disableNameField(form);

        }

        function beforeSubmit(scriptContext) {

            let firstname = scriptContext.newRecord.getValue(ALUMNO_RECORD.Fields.firstname);
            let lastname = scriptContext.newRecord.getValue(ALUMNO_RECORD.Fields.lastname);

            let name = firstname + " " + lastname;
            name = name.trim();
            scriptContext.newRecord.setValue(ALUMNO_RECORD.Fields.name, name);
        }
        

        function afterSubmit(scriptContext) {

            if (scriptContext.type == 'create') {

                let user = runtime.getCurrentUser();

                let name = scriptContext.newRecord.getValue(ALUMNO_RECORD.Fields.name);
                let recipient = scriptContext.newRecord.getValue(ALUMNO_RECORD.Fields.email);

                let body = `
                <table border=1>
                    <tr>
                    <td><b>Nombre</b></td>
                    <td>${name}</td>
                    </tr>
                </table>  
                `
                email.send({
                    author: user.id,
                    recipients: recipient,
                    subject: 'Welcome',
                    body: body
                })

            }

        }


        return { beforeLoad, beforeSubmit, afterSubmit }

    });
