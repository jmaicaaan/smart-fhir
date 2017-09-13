let smart;
let pt;

init();

function init() {
    let config = getConnectionConfig();
    smart = FHIR.client(config, {});
    pt = smart.patient;
    
    loadPatient();
}

function getConnectionConfig() {
    let serviceUrl = 'https://sb-fhir-dstu2.smarthealthit.org/api/smartdstu2/data';
    let accessToken = localStorage.getItem('access_token');
    let patientId = localStorage.getItem('patientId');
    let auth = {
        bearer: accessToken
    };
    let headers = {};
    return {
        serviceUrl: serviceUrl,
        auth: auth,
        headers: headers,
        patientId: patientId
    };
}

function loadPatient() {
    let serviceUrl = 'https://sb-fhir-dstu2.smarthealthit.org/api/smartdstu2/data';
    let patientId = localStorage.getItem('patientId');
    let accessToken = localStorage.getItem('access_token');
    var url = serviceUrl + "/Patient/" + patientId;
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
    }).done(function(pt){
        console.log('pt', pt);
        var name = pt.name[0].given.join(" ") +" "+ pt.name[0].family.join(" ");
        $('#patient_id').val(pt.id);
        $('#firstname').val(pt.name[0].given)
        $('#lastname').val(pt.name[0].family);
        if (pt.gender) {
            if (pt.gender === 'male') {
                $('#rb_male').attr('checked', 'checked');
            } else {
                $('#rb_female').attr('checked', 'checked');
            }
        }
    });
}

function updatePatient() {
    let serviceUrl = 'https://sb-fhir-dstu2.smarthealthit.org/api/smartdstu2/data';
    let patientId = localStorage.getItem('patientId');
    let accessToken = localStorage.getItem('access_token');
    let url = serviceUrl + "/Patient/" + patientId;
    let firstname = document.querySelector('#firstname'),
        lastname = document.querySelector('#lastname'),
        gender = document.querySelector('input[type=radio]:checked');
    let entry = {
        resourceType: 'Patient',
        id: patientId,
        gender: gender.value,
        name: [
            {
                'use': 'official',
                'family': lastname.value,
                'given': [firstname.value]
            }
        ]
    };
    entry = JSON.stringify(entry);

    $.ajax({
        url: url,
        method: 'PUT',
        data: entry,
        headers: {
            "Authorization": "Bearer " + accessToken,
            "Content-Type": "application/json"
        },
    }).done(function(pt) {
        console.log('pt', pt);
        alert('Successfully updated');
    });
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
            alert('Patient Deleted see console');
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
