import React, { useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ==========================================
// カスタムコンポーネント: ピンクのON/OFFトグル
// ==========================================
type ToggleProps = {
  value: boolean;
  onChange: (next: boolean) => void;
};

function PinkToggle({ value, onChange }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={[
        styles.toggle,
        value ? styles.toggleOn : styles.toggleOff,
      ]}
    >
      <Text style={[styles.toggleText, value ? styles.toggleTextOn : styles.toggleTextOff]}>
        {value ? "ON" : "OFF"}
      </Text>
      <View style={[styles.toggleKnob, value ? styles.toggleKnobOn : styles.toggleKnobOff]} />
    </Pressable>
  );
}

// ==========================================
// カスタムコンポーネント: リストの1行分（アイコンなし）
// ==========================================
type RowProps =
  | {
      label: string;
      type: "toggle";
      value: boolean;
      onChange: (next: boolean) => void;
    }
  | {
      label: string;
      type: "link";
      valueText?: string;
      onPress?: () => void;
    };

function SettingRow(props: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{props.label}</Text>

      {props.type === "toggle" ? (
        <PinkToggle value={props.value} onChange={props.onChange} />
      ) : (
        <Pressable onPress={props.onPress} style={styles.rowRight}>
          {props.valueText ? <Text style={styles.rowValue}>{props.valueText}</Text> : null}
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
    </View>
  );
}

// ==========================================
// メイン画面: SettingsScreen
// ==========================================
export default function SettingsScreen() {
  // --- トグルの状態（ON/OFF） ---
  const [notifyAll, setNotifyAll] = useState(true);
  const [notifyBeforeClass, setNotifyBeforeClass] = useState(true);
  const [notifyStudyTimer, setNotifyStudyTimer] = useState(true);
  const [showSupportMessage, setShowSupportMessage] = useState(true);

  const [showCharacter, setShowCharacter] = useState(true);
  const [characterDisplay, setCharacterDisplay] = useState(true);
  const [enableExpression, setEnableExpression] = useState(true);

  // --- 選択項目の状態（現在選ばれている文字） ---
  const [speechSpeed, setSpeechSpeed] = useState("標準");
  const [design, setDesign] = useState("さくら");
  const [themeColor, setThemeColor] = useState("キャンパス");

  // --- ポップアップ（モーダル）の状態管理 ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    options: [] as string[],
    selectedValue: "",
    onSelect: (val: string) => {},
  });

  // 項目をタップした時にポップアップを開く関数
  const openPicker = (title: string, options: string[], currentValue: string, onSelect: (val: string) => void) => {
    setModalConfig({ title, options, selectedValue: currentValue, onSelect });
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* 画面上部：設定タイトル */}
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>設定</Text>
        </View>

        {/* セクション1：通知設定 */}
        <View style={styles.sectionCard}>
          <SettingRow label="通知設定" type="toggle" value={notifyAll} onChange={setNotifyAll} />
          <View style={styles.divider} />
          <SettingRow label="授業前通知" type="toggle" value={notifyBeforeClass} onChange={setNotifyBeforeClass} />
          <View style={styles.divider} />
          <SettingRow label="勉強タイマー通知" type="toggle" value={notifyStudyTimer} onChange={setNotifyStudyTimer} />
          <View style={styles.divider} />
          <SettingRow label="応援メッセージ表示" type="toggle" value={showSupportMessage} onChange={setShowSupportMessage} />
        </View>

        {/* セクション2：キャラクター設定 */}
        <View style={styles.sectionCard}>
          <SettingRow label="キャラクター設定" type="toggle" value={showCharacter} onChange={setShowCharacter} />
          <View style={styles.divider} />
          <SettingRow label="キャラクター表示" type="toggle" value={characterDisplay} onChange={setCharacterDisplay} />
          <View style={styles.divider} />
          <SettingRow label="表情変化" type="toggle" value={enableExpression} onChange={setEnableExpression} />
          <View style={styles.divider} />
          
          {/* 追加：タップでポップアップを開く */}
          <SettingRow
            label="セリフ表示速度"
            type="link"
            valueText={speechSpeed}
            onPress={() => openPicker(
              "セリフ表示速度", 
              ["ゆっくり", "標準", "はやい"], 
              speechSpeed, 
              setSpeechSpeed
            )}
          />
        </View>

        {/* セクション3：デザイン設定 */}
        <View style={styles.sectionCard}>
          {/* 追加：タップでポップアップを開く */}
          <SettingRow
            label="デザイン設定"
            type="link"
            valueText={design}
            onPress={() => openPicker(
              "デザイン設定", 
              ["さくら", "あおぞら", "わかば", "ほしぞら"], 
              design, 
              setDesign
            )}
          />
          <View style={styles.divider} />
          
          {/* 追加：タップでポップアップを開く */}
          <SettingRow
            label="テーマカラー"
            type="link"
            valueText={themeColor}
            onPress={() => openPicker(
              "テーマカラー", 
              ["キャンパス", "ノート", "こくばん"], 
              themeColor, 
              setThemeColor
            )}
          />
        </View>

      </ScrollView>

      {/* ==========================================
          選択肢のポップアップ（Modal）
      ========================================== */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)} // Androidの戻るボタン対応
      >
        {/* 背景の黒い半透明部分（タップで閉じる） */}
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          {/* ポップアップの白い箱 */}
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            
            {/* 選択肢をリスト表示 */}
            {modalConfig.options.map((option, index) => {
              const isLast = index === modalConfig.options.length - 1;
              const isSelected = option === modalConfig.selectedValue;
              
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.modalOption, isLast && styles.modalOptionLast]}
                  onPress={() => {
                    modalConfig.onSelect(option); // 選んだ文字を保存
                    setModalVisible(false); // ポップアップを閉じる
                  }}
                >
                  <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

// ==========================================
// スタイル設定（色や配置）
// ==========================================
const BG_COLOR = "#fdf5f8";        
const CARD_BG = "rgba(255, 255, 255, 0.7)"; 
const TEXT_COLOR = "#3b2f38";      
const PINK_MAIN = "#e6a8c4";       

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  content: { paddingHorizontal: 16, paddingTop: 40, paddingBottom: 40, gap: 20 },

  /* 上部のタイトル枠 */
  headerBox: {
    borderWidth: 1.5, borderColor: "#f1c2d6", borderRadius: 8,
    paddingVertical: 12, alignItems: "center", backgroundColor: "#fff", marginBottom: 10,
  },
  headerTitle: { fontSize: 24, color: "#6b5e68", fontWeight: "bold", letterSpacing: 2 },

  /* リストのカード（白い枠） */
  sectionCard: { backgroundColor: CARD_BG, borderRadius: 8, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  rowLabel: { flex: 1, fontSize: 16, color: TEXT_COLOR },
  rowRight: { flexDirection: "row", alignItems: "center" },
  rowValue: { fontSize: 14, color: "#8a7b85", marginRight: 4 },
  chevron: { fontSize: 20, color: "#8a7b85" },
  divider: { height: 1, backgroundColor: "#f2e4ec", marginLeft: 16 },

  /* カスタムトグル（ON/OFFスイッチ） */
  toggle: { width: 60, height: 28, borderRadius: 14, paddingHorizontal: 4, flexDirection: "row", alignItems: "center" },
  toggleOn: { backgroundColor: PINK_MAIN, justifyContent: "flex-start" },
  toggleOff: { backgroundColor: "#d1c6cb", justifyContent: "flex-end" },
  toggleText: { fontSize: 12, fontWeight: "bold", position: "absolute" },
  toggleTextOn: { color: "#fff", left: 8 },
  toggleTextOff: { color: "#fff", right: 8 },
  toggleKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", position: "absolute" },
  toggleKnobOn: { right: 3 },
  toggleKnobOff: { left: 3 },

  /* モーダル（ポップアップ）のスタイル */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // 背景を暗くする
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "75%",
    paddingTop: 20,
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6b5e68",
    textAlign: "center",
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f2e4ec",
    alignItems: "center",
  },
  modalOptionLast: {
    borderBottomWidth: 0,
  },
  modalOptionText: {
    fontSize: 16,
    color: TEXT_COLOR,
  },
  modalOptionTextSelected: {
    color: PINK_MAIN,
    fontWeight: "bold",
  },
});