import { disconnect } from 'mongoose';
import { studentsModel } from './orm/schemas/studentSchemas';
import { connectStudentHub } from './utils/MongoDB';

async function seed() {
    await connectStudentHub();
    await studentsModel.init();

    if (await studentsModel.exists({})) {
        console.log('學生清單已有資料，略過初始化。');
        return;
    }

    const samples = [
        { userName: 'tkubm0101', name: '範例學生甲', department: '資訊管理學系', grade: '一年級', class: 'A' },
        { userName: 'tkuee0102', name: '範例學生乙', department: '電機工程學系', grade: '二年級', class: 'B' },
    ];

    await studentsModel.insertMany(samples.map((student, index) => ({
        ...student,
        sid: String(index + 1),
        Email: `${student.userName}@example.com`,
    })));
    console.log(`已新增 ${samples.length} 筆學生測試資料。`);
}

seed().catch(() => {
    console.error('初始化失敗，請檢查 MongoDB 設定。');
    process.exitCode = 1;
}).finally(() => disconnect());
