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
    getPatientMedicationRequest();
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

/**
 * Medication Module
 */

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
            },
            ingredient: [
                {
                    amount: {
                        numerator: {
                            value: 5,
                            system: 'http://unitsofmeasure.org',
                            code: 'mg'
                        },
                        denominator: {
                            value: 1,
                            system: 'http://hl7.org/fhir/v3/orderableDrugForm',
                            code: 'TAB'
                        }
                    }
                }
            ]
        },
    };
    pt.api.create(entry).then((medication) => {
        console.log('medication', medication);
    });
}

function addMedicationRequest() {
    let entry = {
        resource: {
            resourceType: 'MedicationOrder',
            status: 'active',
            intent: 'proposal',
            medicationReference: {
                reference: 'Medication/16711', //this reference from the added medication from addPatientMedication()
                display: 'Medicine for ISBX Developers 50 MG Oral Tablet'
            },
            patient: {
                reference: 'Patient/' + pt.id
            },
            requester: {
                agent: {
                    reference: 'Patient/SMART-1288992'
                }
            },
            substitution: {
                allowed: true
            }
        }
    }
    pt.api.create(entry).then((response) => {
        console.log('response med', response);=
        getPatientMedicationRequest(true);
    });
}

function addMedicationAdministration() {
    let entry = {
        resource: {
            resourceType: 'MedicationAdministration',
            status: 'in-progress',
            contained: [
                {
                    resourceType: 'Medication',
                    id: 'med-isbx',
                    code: {
                        coding: [
                            {
                                system: 'http://hl7.org/fhir/sid/ndc',
                                code: '0069-2587-10',
                                display: 'Vancomycin Hydrochloride (VANCOMYCIN HYDROCHLORIDE)'
                            }
                        ]
                    }
                }
            ],
            medicationReference: {
                reference: '#med-isbx'
            },
            subject: {
                reference: 'Patient/' + pt.id,
                display: _patient.name[0].given + _patient.name[0].family
            },
            performer: [
                {
                    actor: {
                        reference: 'Patient/' + pt.id
                    }
                }
            ]
        }
    };

    pt.api.create(entry).then((response) => {
        console.log('response', response);
    });
}

function getPatientMedicationRequest(refresh) {
    if (refresh) $('#patient-medication-request-list').html('');
    pt.api.fetchAllWithReferences({ type: 'MedicationOrder', query: { 
        patient: pt.id
     }}).then((medications) => {
        medications.forEach((medication) => {
            console.log('medication', medication.medicationCodeableConcept? medication.medicationCodeableConcept.text : medication.medicationReference.display);
            if (medication && medication.medicationCodeableConcept) {
                $('#patient-medication-request-list').append(`<li> ${medication.medicationCodeableConcept.text} </li>`);
            } else if (medication && medication.medicationReference && medication.medicationReference.display) {
                $('#patient-medication-request-list').append(`<li> ${medication.medicationReference.display} </li>`);
            }
        });
    });
}

/**
 * Appointment Module
 */

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
    pt.api.fetchAllWithReferences({ type: 'Appointment', query: { 
        patient: pt.id
     }}).then((appointments) => {
        appointments.forEach((appointment) => {
            if (appointment.description) {
                $('#patient-appointment-list').append(`<li> ${appointment.description} -> ${appointment.start} - ${appointment.end} </li>`);
            }
        });
    });
}