/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N'],

    (N) => {

        const { log, search, record, runtime, file, url } = N;


        function lookUpEmployee(token) {

            if (!token) return null;

            let name = '';

            search.create({
                type: 'employee',
                columns: ['firstname', 'lastname'],
                filters: [
                    ['custentity_bm_token_r', 'is', token]
                ]
            }).run().each(node => {

                name = node.getValue(node.columns[0]) + " " + node.getValue(node.columns[1]);
                return false;
            });

            return name;

        }


        const onRequest = (scriptContext) => {

            if (scriptContext.request.method == 'POST') {

                scriptContext.response.setHeader('Content-Type', 'application/json');

                let headers = scriptContext.request.headers;

                let token = headers["x-biomont-conection"];

                let employee = lookUpEmployee(token);

                if (employee) {

                    log.error('Current User', runtime.getCurrentUser());

                    var host = url.resolveDomain({
                        hostType: url.HostType.APPLICATION,
                        accountId: runtime.accountId
                    });

                    let path = file.load(26018).url;

                    scriptContext.response.write(JSON.stringify({
                        url: "https://" + host + "" + path
                    }));

                } else {
                    scriptContext.response.write(JSON.stringify({
                        status: false,
                        message: 'Not Access'
                    }))
                }

            }

        }

        let x = {
            "id": -4,
            "name": "-Sistema-",
            "email": "onlineformuser@6462530-sb1.com",
            "location": 0,
            "department": 0,
            "role": 31,
            "roleId": "online_form_user",
            "roleCenter": "CUSTOMER",
            "subsidiary": 1
        }

        return { onRequest }


    });


