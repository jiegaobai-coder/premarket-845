package main

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"time"
)

const url = "http://127.0.0.1:8451/"

func main() {
	root, err := findRoot()
	if err != nil {
		fatal(err.Error())
	}
	if err := os.Chdir(root); err != nil {
		fatal(err.Error())
	}

	fmt.Println("8:45 盘前分析")
	fmt.Println("观察时刻是每天 8:45。页面不会到点自动换新数据。")
	fmt.Println("名单跟着你当天那份 Schwab PDF 走。")
	fmt.Println()
	fmt.Println("目录：", root)

	if !hasNode() {
		fatal("没找到 Node.js。先安装 Node.js LTS，然后再双击这个程序。")
	}

	if _, err := os.Stat(filepath.Join(root, "node_modules")); err != nil {
		fmt.Println("第一次打开：正在 npm install …")
		if err := run(npmCmd(), "install"); err != nil {
			fatal("npm install 失败：" + err.Error())
		}
	}

	startedHere := false
	var server *exec.Cmd
	if responding() {
		fmt.Println("页面已经在跑，直接打开浏览器。")
	} else {
		fmt.Println("正在启动本地页面 …")
		server = exec.Command(npmCmd(), "run", "dev")
		server.Dir = root
		server.Stdout = os.Stdout
		server.Stderr = os.Stderr
		if err := server.Start(); err != nil {
			fatal("启动失败：" + err.Error())
		}
		startedHere = true
		if err := waitUntilUp(45 * time.Second); err != nil {
			_ = server.Process.Kill()
			fatal("等页面启动超时。请确认 8451 端口没被占用，并再试一次。")
		}
	}

	if err := openBrowser(url); err != nil {
		fmt.Println("请手动打开：", url)
	} else {
		fmt.Println("已打开：", url)
	}

	if startedHere {
		fmt.Println()
		fmt.Println("关掉这个黑窗口，页面就会停。")
		_ = server.Wait()
		return
	}

	fmt.Println("按回车退出。")
	_, _ = fmt.Scanln()
}

func findRoot() (string, error) {
	exe, err := os.Executable()
	if err != nil {
		return "", err
	}
	dir := filepath.Dir(exe)
	for _, candidate := range []string{dir, filepath.Dir(dir), mustAbs(".")} {
		if _, err := os.Stat(filepath.Join(candidate, "package.json")); err == nil {
			if _, err := os.Stat(filepath.Join(candidate, "src", "data", "briefing.ts")); err == nil {
				return candidate, nil
			}
		}
	}
	return "", fmt.Errorf("找不到项目文件夹。请把这个 exe 放在 8:45 盘前项目根目录再打开")
}

func mustAbs(p string) string {
	abs, err := filepath.Abs(p)
	if err != nil {
		return p
	}
	return abs
}

func npmCmd() string {
	if runtime.GOOS == "windows" {
		return "npm.cmd"
	}
	return "npm"
}

func hasNode() bool {
	_, err := exec.LookPath("node")
	if err != nil && runtime.GOOS == "windows" {
		_, err = exec.LookPath("node.exe")
	}
	return err == nil
}

func run(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func responding() bool {
	client := &http.Client{Timeout: 800 * time.Millisecond}
	res, err := client.Get(url)
	if err != nil {
		return false
	}
	defer res.Body.Close()
	return res.StatusCode < 500
}

func waitUntilUp(timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		if responding() {
			return nil
		}
		time.Sleep(400 * time.Millisecond)
	}
	return fmt.Errorf("timeout")
}

func openBrowser(target string) error {
	if runtime.GOOS == "windows" {
		return exec.Command("cmd", "/c", "start", "", target).Start()
	}
	return exec.Command("xdg-open", target).Start()
}

func fatal(msg string) {
	fmt.Println(msg)
	fmt.Println("按回车关闭。")
	_, _ = fmt.Scanln()
	os.Exit(1)
}
