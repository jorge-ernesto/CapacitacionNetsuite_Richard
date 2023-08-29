/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N'],

    (N) => {

        const { search, log, record } = N;

        function getComprobantesList() {

            let result = [];

            search.create({
                type: 'customtransaction_ns_comp_ret',
                columns: ['internalid', 'name', 'amount']
            }).run().each(node => {

                let id = node.getValue(node.columns[0]);
                let name = node.getValue(node.columns[1]);
                let amount = node.getValue(node.columns[2]);

                result.push({ id, name, amount });
                return true;
            });
            return result;

        }


        function get(requestParams) {

            let comprobantes = getComprobantesList();

            return JSON.stringify(comprobantes);

        }

        function post(context) {
            let { companyName } = context;

            let customerRecord = record.create({ type: 'customer' });
            customerRecord.setValue('companyname', companyName);
            customerRecord.setValue('subsidiary', 2);
            customerRecord.setValue('email', 'ejemplo@customrest.com');

            customerRecord = customerRecord.save({ ignoreMandatoryFields: true })

            return 'Customer ' + customerRecord + " Created";
        }

        function put(context) {

            let { id, email } = context;

            let customerRecord = record.load({ type: 'customer', id: id });
            customerRecord.setValue('custentity24', email);

            customerRecord = customerRecord.save({ ignoreMandatoryFields: true })

            return 'Customer ' + customerRecord + " Updated";
        }


        function doDelete(context) {

            log.debug('delete', context)

            let { _customer } = context;

            record.delete({ type: 'customer', id: _customer })

            /*let customerRecord = record.load({ type: 'customer', id: _customer });
            customerRecord.setValue('isinactive', true);

            customerRecord = customerRecord.save({ ignoreMandatoryFields: true })*/

            return 'Customer deleted';
        }

        return { get, put, post, delete: doDelete }

    });
