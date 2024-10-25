
增加邀请码字段
ALTER TABLE auth 
ADD COLUMN invitationcode VARCHAR(20) UNIQUE DEFAULT NULL;

为已经存在的用户添加邀请码
UPDATE auth 
SET invitationcode = SUBSTRING(MD5(RAND()), 1, 6)
WHERE invitationcode IS NULL;


创建邀请记录表
CREATE TABLE invite_info  (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inviteid INT NOT NULL,       
    invitequot FLOAT(10, 2),              
    userquot FLOAT(10, 2),                  
    userid INT NOT NULL,                   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   
);
