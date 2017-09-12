let smart;
let pt;

init();

function init() {
    let config = getConnectionConfig();
    smart = FHIR.client(config, {});
    pt = smart.patient;
}

function getConnectionConfig() {
    let serviceUrl = 'https://sb-fhir-dstu2.smarthealthit.org/api/smartdstu2/open';
    let auth = {};
    let headers = {};
    return {
        serviceUrl: serviceUrl,
        auth: auth,
        headers: headers
    };
}

function upsertPatient() {
    let patientId = document.querySelector('#patient_id'),
        firstname = document.querySelector('#firstname'),
        lastname = document.querySelector('#lastname'),
        gender = document.querySelector('input[type=radio]:checked');
    
    if (!firstname || !lastname || !gender) {
        alert('Incomplete fields');
        return;
    }
    let entry = {
        resource: {
            resourceType: 'Patient',
            gender: gender.value,
            name: [
                {
                    'use': 'official',
                    'family': lastname.value,
                    'given': [firstname.value]
                }
            ]
        },
    };
    if (patientId && patientId.value) {
        entry.resource.id = patientId.value;
        pt.api.update(entry).then((response) => {
            console.log('response', response);
        }, (err) => {
            console.log('err', err);
        });
    } else {
        pt.api.create(entry).then((response) => {
            console.log('response', response);
        }, (err) => {
            console.log('err', err);
        });
    }
}

function searchPatient(type) {
    let query = {};
    if (type === 'id') {
        // 149698
        let patientID = document.querySelector('#s_patient_id').value;
        query = {
            _id: patientID
        };
    }
    else if (type === 'name') {
        let patientName = document.querySelector('#s_patient_name').value;
        let name = {
            $or: patientName.split(' ')
        };
        query = {
            name: name
        };
    }
    smart.api.search({ type: 'Patient', query: query }).then((pt) => {
        document.querySelector('.patient-results').innerHTML = '';
        document.querySelector('.patient-results').innerHTML = JSON.stringify(pt.data.entry, undefined, 2);
        clearFields();
    });
}

function deletePatient() {
    let patientId = document.querySelector('#d_patient_id');
    if (patientId && patientId.value) {
        let entry = {
            resource: {
                id: patientId.value,
                resourceType: 'Patient'
            },
        };
        smart.api.delete(entry).then((pt) => {
            console.log('pt delete', pt);
        });
    }
}

function clearFields() {
    document.querySelectorAll('input').forEach((k, v) => {
        if (k.type === 'radio') {
            k.value = k.defaultChecked;
            return;
        }
        k.value = k.defaultValue;
    });
}
