//applicant model 
const Applicant = {
    applicantID: {
        type: 'string', 
        allowNull: false, 
    }, 
    name: {
        type: 'string', 
        allowNull: false, 
    }, 
    gwa: {
        type: 'float',
        allowNull: false, 
        min: 1.00,
        max: 5.00
    },
    gender: {
        type: ['F', 'M'], 
        allowNull: false
    },
    age: {
        type: 'integer',
        allowNull: false,
        min: 2,
        max: 99
    }, 
    date_of_birth: {
        type: 'date', 
        allowNull: false
    }, 
    civil_stat: {
        type: ['S', 'M', 'W'], 
        allowNull: false
    },
    religion: {
        type: 'string', 
        allowNull: false
    }, 
    address: {
        type: 'string',
        allowNull: false
    }, 
    place_birth: {
        type: 'string',
        allowNull: false
    }, 
    mobile_no: {
        type: 'integer', 
        allowNull: false
    }, 
    email: {
        type: 'string', 
        allowNull: false
    }, 
    current_level: {
        type: ['E', 'JH', 'SH', 'T'],
        allowNull: false
    },
    course: {
        type: 'string',
        allowNull: true
    },
    expected_date_grad: {
        type: 'date',
        allowNull: true
    },
    mode_of_receipt: {
        type: ['CC', 'P'],
        allowNull: false
    }, 
    cash_card_no: {
        type: 'integer',
        allowNull: true
    }, 
    combined_monthly_income: {
        type: 'integer', 
        allowNull: false
    }
}

//family model
const Family = {
    applicantID: {
        type: 'string', 
        allowNull: false, 
    }, 
    name: {
        type: 'string', 
        allowNull: false, 
    }, 
   relation_type: {
        type: ['Father', 'Mother', 'Guardian'],
        primaryKey: true
   }, 
   occupation: {
        type: 'string',
        allowNull: false
   },
   monthly_income: {
        type: 'integer', 
        allowNull: false
   }
}; 

//educ background model
const Educ_Background = {
    backgroundID: {
        type: 'string', 
        allowNull: false, 
    }, 
    applicantID: {
        type: 'string', 
        allowNull: false, 
    }, 
    schoolID: {
        type: 'string',
        allowNull: false, 
    }, 
    level: {
        type: ['E', 'JH', 'SH', 'T'],
        allowNull: false
    },
    inclusive_years: {
        type: 'string', 
        allowNull: false
    }, 
    honors: {
        type: 'string', 
        allowNull: true
    }
}

//school model
const School = {
    schoolID: {
        dataType: 'string', 
        allowNull: false
    },
    name: {
        dataType: 'string', 
        allowNull: false, 
    }, 
    location: {
        dataType: 'string',
        allowNull: false,
    }, 
    type: {
        dataType: ['Public', 'Private'],
        allowNull: false
    },
}

const models = [Applicant, Family, Educ_Background, School]; 
const modelNames = ['applicant', 'family', 'educ_Background', 'school']; 

//check if model exists 
function isModel(model){
    if(models.includes(model)){
        return true;
    } else {
        return false
    }
}

function isComplete(input, model){
    input = Object.keys(input);
    model = Object.keys(model);
    return model.every(key => input.includes(key));
}

const validate = (input, model, mode) => {
    console.log(input);
    model = models[modelNames.indexOf(model)]
    if (!isModel) return false
    if (mode == 1 && !isComplete(input, model)) return false
    for (let key in input) {

        if (input.hasOwnProperty(key)) {
            if (!model[key]) {
                // If there's no corresponding model definition for this key, consider it invalid
                return false;
            }

            const value = input[key];
            const constraints = model[key];

            // Check allowNull condition
            if (!constraints.allowNull && (value === null || value === undefined)) {
                return false;
            }

            // Check dataType condition
            if (constraints.dataType) {
                switch (constraints.dataType) {
                    case 'string':
                        if (typeof value !== 'string') {
                            return false;
                        }
                        break;
                    case 'integer':
                        if (!(Number.isInteger(value))) {
                            return false;
                        }
                        break;
                    case 'float':
                        if (typeof value !== 'number' || !Number.isFinite(value)) {
                            return false;
                        }
                        break;
                }

                if(Array.isArray(constraints.dataType)){
                    if (!constraints.dataType.includes(value)) {
                        return false;
                    }
                }
            }

            // Check min value condition
            if (constraints.min !== undefined && value < constraints.min) {
                return false;
            }

            // Check max value condition
            if (constraints.max !== undefined && value > constraints.max) {
                return false;
            }
        }
    }
    return true; // All checks passed
}

//test
const testInput = {
    schoolID: 20, 
    name: 'eee', 
    location: 'ee',
    type: 'Public'
}

console.log(validate(testInput, 'school'));

module.exports = {validate} 