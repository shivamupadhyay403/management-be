const mongoose = require('mongoose')
const handleConnecttoDb = async () => {
    try {
        await mongoose.connect(process.env.DB_URI)
    } catch (err) {
        console.log(err)
    }
}
module.exports = handleConnecttoDb
