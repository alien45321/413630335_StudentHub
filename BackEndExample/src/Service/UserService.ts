import { Service } from "../abstract/Service";
import { Student } from "../interfaces/Student";
import { studentsModel } from "../orm/schemas/studentSchemas";
import { DBResp } from "../interfaces/DBResp";
import { resp } from "../utils/resp";

const studentFields = ['userName', 'name', 'department', 'grade', 'class', 'Email'] as const;

export class UserService extends Service {
    public async getAllStudents(): Promise<Array<DBResp<Student>> | undefined> {
        try {
            return await studentsModel.find({}).sort({ _id: 1 });
        } catch {
            return undefined;
        }
    }

    public async insertOne(info: Student): Promise<resp<DBResp<Student> | undefined>> {
        if (!info || studentFields.some(field => typeof info[field] !== 'string' || !info[field].trim())) {
            return { code: 400, message: '請填寫所有學生欄位', body: undefined };
        }

        const userName = info.userName.trim();
        const seatNumber = /^tku[a-z]+(\d{4})$/.exec(userName)?.[1];
        if (!seatNumber) {
            return { code: 403, message: '學生帳號應為 tku + 科系縮寫 + 四碼座號', body: undefined };
        }

        for (let attempt = 0; attempt < 5; attempt += 1) {
            const current = await this.getAllStudents();
            if (!current?.length) {
                return { code: 500, message: '請先初始化學生清單', body: undefined };
            }
            if (current.length >= 200) {
                return { code: 403, message: 'student list is full', body: undefined };
            }
            if (current.some(student => student.userName.endsWith(seatNumber))) {
                return { code: 403, message: '座號已存在', body: undefined };
            }

            const latestSid = Math.max(...current.map(student => Number(student.sid) || 0));
            const student = new studentsModel({
                userName,
                sid: String(latestSid + 1),
                name: info.name.trim(),
                department: info.department.trim(),
                grade: info.grade.trim(),
                class: info.class.trim(),
                Email: info.Email.trim(),
            });

            try {
                return { code: 200, message: '', body: await student.save() };
            } catch (error) {
                // Another request may have assigned the same sid. Read the list again.
                if ((error as { code?: number }).code !== 11000) break;
            }
        }
        return { code: 500, message: 'server error', body: undefined };
    }
}
