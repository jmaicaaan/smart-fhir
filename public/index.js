let smart;
let pt;
let _patient;

init();

function init() {
    let config = getConnectionConfig();
    smart = FHIR.client(config, {});
    pt = smart.patient;
    
    loadPatient();
    getPatientAppointments();
}

function getConnectionConfig() {
    const serviceUrl = 'https://sb-fhir-dstu2.smarthealthit.org/api/smartdstu2/data';
    const patientId = localStorage.getItem('patientId');
    const accessToken = localStorage.getItem('access_token');
    let auth = {
        type: 'bearer',
        token: accessToken
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
    pt.read().then((patient) => {
        console.log('patient', patient);
        _patient = patient;
        var name = patient.name[0].given.join(" ") + " " + patient.name[0].family.join(" ");
        $('#patient_id').val(patient.id);
        $('#firstname').val(patient.name[0].given)
        $('#lastname').val(patient.name[0].family);
        if (patient.gender) {
            if (patient.gender === 'male') {
                $('#rb_male').attr('checked', 'checked');
            } else {
                $('#rb_female').attr('checked', 'checked');
            }
        }
    });
}

function updatePatient() {
    let firstname = $('#firstname').val(),
        lastname = $('#lastname').val(),
        gender = $('input[type=radio]:checked').val();
    let entry = {
        resource: {
            resourceType: 'Patient',
            id: pt.id,
            gender: gender,
            name: [
                {
                    'use': 'official',
                    'family': lastname,
                    'given': [firstname]
                }
            ]
        }
    };

    pt.api.update(entry).then((patient) => {
        console.log(patient);
        alert('Successfully updated Patient');
    });
}

function addPatientMedication() {
    let medication = $('#patient-medication').val();
    let entry = {
        resource: {
            resourceType: 'Medication',
            status: 'active',
            contained: [
                {
                    resourceType: 'Organization',
                    id: 'ph-org',
                    name: 'ISBX'
                }
            ],
            form: {
                coding: [
                    {
                        system: 'http://google.com.ph',
                        code: '123456789',
                        display: 'Sample Medication from ISBX'
                    }
                ]
            },
            manufacturer: {
                reference: '#ph-org'
            }
        },
    };
    pt.api.create(entry).then((medication) => {
        console.log('medication', medication);
    });
}

function test() {
    console.log('smart', smart);

    let entry = {
        resource: {
            resourceType: 'MedicationOrder',
            status: 'active',
            intent: 'order',
            priority: 'asap',
            medicationReference: {
                reference: 'Medication/16711',
                display: 'Medication ISBX'
            },
            subject: {
                reference: 'Patient/' + pt.id,
                display: 'JM Santos'
            },
            authoredOn: '2017-09-13',
            requester: {
                agent: {
                    reference: 'Practitioner/SMART-1234',
                    display: 'John Smith'
                }
            },
            onBehalfOf: {
                reference: 'Organization/0fe781ca-464b-4649-a523-b4159d1cf614'
            },
            "reasonCode": [
                {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "11840006",
                            "display": "Traveller's Diarrhea (disorder)"
                        }
                    ]
                }
            ],
            "dosageInstruction": [
                {
                    "sequence": 1,
                    "text": "500mg daily for 5 days",
                    "additionalInstruction": [
                        {
                            "coding": [
                                {
                                    "system": "http://snomed.info/sct",
                                    "code": "421984009",
                                    "display": "Until finished - dosing instruction fragment (qualifier value)"
                                }
                            ]
                        }
                    ],
                    "timing": {
                        "repeat": {
                            "frequency": 1,
                            "period": 1,
                            "periodUnit": "d"
                        }
                    },
                    "route": {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "26643006",
                                "display": "Oral Route (qualifier value)"
                            }
                        ]
                    },
                    "doseQuantity": {
                        "value": 500,
                        "unit": "mg",
                        "system": "http://unitsofmeasure.org",
                        "code": "mg"
                    }
                }
            ],
            "dispenseRequest": {
                "validityPeriod": {
                    "start": "2015-01-15",
                    "end": "2016-01-15"
                },
                "quantity": {
                    "value": 5,
                    "unit": "Tab",
                    "system": "http://hl7.org/fhir/v3/orderableDrugForm",
                    "code": "Tab"
                },
                "expectedSupplyDuration": {
                    "value": 5,
                    "unit": "days",
                    "system": "http://unitsofmeasure.org",
                    "code": "d"
                }
            }
        }
    };

    pt.api.create(entry).then((messageRequest) => {
        console.log('messageRequest', messageRequest);
        smart.patient.api.fetchAllWithReferences({ type: "Appointment" }).then(function(results, refs) {
            console.log('results', results);
            console.log('refs', refs);
        });
    });
}

function addPatientAppointment() {
    let d = new Date();
    let startDate = d.toISOString(),
        endDate = d.toISOString(),
        createdDate = d.toISOString();
    let entry = {
        resource: {
            resourceType: 'Appointment',
            status: 'booked',
            priority: 5,
            description: 'Discussion regarding SMART on FHIR',
            start: startDate,
            end: endDate,
            created: createdDate,
            participant: [
                {
                    actor: {
                        reference: 'Patient/' + pt.id,
                        display: _patient.name[0].given + _patient.name[0].family
                    },
                    required: 'required',
                    status: 'accepted'
                },
                {
                    actor: {
                        reference: 'Location/CORELOCATIONS2',
                        display: 'South Wing, 2nd floor' 
                    },
                    required: 'required',
                    status: 'accepted'
                }
            ],
        }
    };

    pt.api.create(entry).then((appointment) => {
        console.log('appointment', appointment);
        getPatientAppointments(true);
    });
}

function getPatientAppointments(refresh) {
    if (refresh) $('#patient-appointment-list').html('');
    pt.api.fetchAllWithReferences({ type: 'Appointment' }).then((results) => {
        results.forEach((k) => {
            console.log('', k);
            if (k.description) {
                $('#patient-appointment-list').append(`<li> ${k.description} -> ${k.start} - ${k.end} </li>`);
            }
        });
    });
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
