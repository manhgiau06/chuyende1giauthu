<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemConfig;
use Illuminate\Http\Request;

class SystemConfigController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền xem cấu hình hệ thống!'], 403);
        }

        $configs = SystemConfig::all();
        return response()->json(['configs' => $configs]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Chỉ có Quản trị viên mới có quyền cập nhật cấu hình!'], 403);
        }

        $request->validate([
            'configs' => 'required|array',
            'configs.*.key' => 'required|string',
            'configs.*.value' => 'required|string',
        ]);

        foreach ($request->configs as $cfg) {
            SystemConfig::where('key', $cfg['key'])->update(['value' => $cfg['value']]);
        }

        return response()->json([
            'message' => 'Cập nhật cấu hình hệ thống thành công!',
            'configs' => SystemConfig::all(),
        ]);
    }
}
