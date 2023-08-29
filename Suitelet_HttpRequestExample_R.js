/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N'],

    (N) => {

        const { https, log, http } = N;

        const route = 'https://dog.ceo/api/breeds/image/random/10';
        const sunatRoute = 'https://api.apis.net.pe/v1/tipo-cambio-sunat';

        const requestURL = 'https://reqres.in/api/users';

        function getPerritosImagesList() {


            let response = https.get({
                url: sunatRoute
            });

            return JSON.parse(response.body);

        }

        function sendRequest(name, job) {

            let response = https.post({
                url: requestURL,
                body: JSON.stringify({
                    name: name,
                    job: job,
                })
            });

            return JSON.parse(response.body);

        }


        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            if (scriptContext.request.method == 'GET') {


                let responseData = sendRequest("Richard", "Profesor");

                log.debug('Sunat Data', responseData);

                scriptContext.response.setHeader('Content-type', 'application/json');
                scriptContext.response.write(JSON.stringify(responseData));

            }

        }

        return { onRequest }

    });
