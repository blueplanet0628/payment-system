const bcrypt = require('bcrypt');
const db = require('../model/database');
const jwt = require('jsonwebtoken')

const register = async (req, res) => {

    
    try {
        const { name, email, password } = JSON.parse(req.body);

        

        const checkQuery = 'SELECT * FROM user WHERE email = ?';
        db.query(checkQuery, [email], async (err, results) => {

            const hashedPassword = await bcrypt.hash(password, 10);
            
            const insertQuery = 'INSERT INTO user (name, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [name, email, hashedPassword], (insertErr, insertResults) => {
                if (insertErr) {
                    console.error('Error inserting data:', insertErr);
                    return res.status(500).json({ message: 'データベースエラーが発生しました。' });
                }

                res.status(200).json({ message: '正常に登録されました。' });
            });
        });

    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = JSON.parse(req.body);

        if (!email || !password) {
            return res.status(400).json({ message: 'Emailとパスワードは必須です。' });
        }
        const checkQuery = 'SELECT * FROM user WHERE email = ?';
        const checkpass = 'SELECT * FROM user WHERE password = ?';
        db.query(checkQuery, [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'データベースエラーが発生しました。' });
            }

            if (results.length == 0) {
                return res.status(400).json({ message: '登録ユーザーはいません。' })
            } else {
                const user = results[0];
                const hashedPassword = await bcrypt.hash(password, 10);
                
                db.query(checkpass, [hashedPassword], async (err, results) => {
                    if (!results) {
                        return res.status(400).json({ message: 'パスワードを正しく入力してください。' })
                    } else {

                       const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, { expiresIn: '1h' });

                         
                          
                        res.status(200).json({ message: 'ユーザー情報が確認されました。' , token, email})
                    }
                })
            }
        });

    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
};

module.exports = { register, login };
