module.exports = {
    loadPatient: loadPatient
};
function loadPatient(fhir, callback) {
    if (!fhir) { 
        console.log('no fhir object initialized'); 
        return;
    }
    fhir.search({
        type: 'Patient'
    }).then((resp) => {
        callback(null, resp.data);
    }).catch((error) => {
        callback(error, null)
    });
}