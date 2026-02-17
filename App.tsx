import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";

const RPC = "https://api.mainnet-beta.solana.com";

const rpc = async (method: string, params: any[]) => {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
};

const getBalance = async (addr: string) => {
  const result = await rpc("getBalance", [addr]);
  return result.value / 1_000_000_000;
};

const getTokens = async (addr: string) => {
  const result = await rpc("getTokenAccountsByOwner", [
    addr,
    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
    { encoding: "jsonParsed" },
  ]);
  return (result.value || [])
    .map((a: any) => ({
      mint: a.account.data.parsed.info.mint,
      amount: a.account.data.parsed.info.tokenAmount.uiAmount,
    }))
    .filter((t: any) => t.amount > 0);
};

const getTxns = async (addr: string) => {
  const sigs = await rpc("getSignaturesForAddress", [addr, { limit: 10 }]);
  return sigs.map((s: any) => ({
    sig: s.signature,
    time: s.blockTime,
    ok: !s.err,
  }));
};

const short = (s: string, n = 4) => `${s.slice(0, n)}...${s.slice(-n)}`;

const timeAgo = (ts: number) => {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function App() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);

  const search = async () => {
    const addr = address.trim();
    if (!addr) return Alert.alert("Enter a wallet address");

    setLoading(true);
    try {
      const [bal, tok, tx] = await Promise.all([
        getBalance(addr),
        getTokens(addr),
        getTxns(addr),
      ]);
      setBalance(bal);
      setTokens(tok);
      setTxns(tx);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
    setLoading(false);
  };

  const tryExample = () => {
    const example = "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY";
    setAddress(example);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll}>
        {/* Header */}
        <Text style={s.title}>SolView</Text>
        <Text style={s.subtitle}>Explore any Solana wallet</Text>

        {/* Search */}
        <View style={s.inputContainer}>
          <TextInput
            style={s.input}
            placeholder="Enter wallet address..."
            placeholderTextColor="#6B7280"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={s.btnRow}>
          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={search}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={s.btnText}>Search</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnGhost}
            onPress={tryExample}
            activeOpacity={0.7}
          >
            <Text style={s.btnGhostText}>Demo</Text>
          </TouchableOpacity>
        </View>

        {balance !== null && (
          <View style={s.card}>
            <Text style={s.label}>SOL Balance</Text>
            <View style={s.balanceRow}>
              <Text style={s.balance}>{balance.toFixed(4)}</Text>
              <Text style={s.sol}>SOL</Text>
            </View>
            <Text style={s.addr}>{short(address.trim(), 6)}</Text>
          </View>
        )}

        {tokens.length > 0 && (
          <>
            <Text style={s.section}>Tokens ({tokens.length})</Text>
            <FlatList
              data={tokens}
              keyExtractor={(t) => t.mint}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={s.row}>
                  <Text style={s.mint}>{short(item.mint, 6)}</Text>
                  <Text style={s.amount}>{item.amount}</Text>
                </View>
              )}
            />
          </>
        )}

        {txns.length > 0 && (
          <>
            <Text style={s.section}>Recent Transactions</Text>
            <FlatList
              data={txns}
              keyExtractor={(t) => t.sig}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.row}
                  onPress={() =>
                    Linking.openURL(`https://solscan.io/tx/${item.sig}`)
                  }
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={s.mint}>{short(item.sig, 8)}</Text>
                    <Text style={s.time}>
                      {item.time ? timeAgo(item.time) : "pending"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      s.statusIcon,
                      { color: item.ok ? "#14F195" : "#EF4444" },
                    ]}
                  >
                    {item.ok ? "+" : "-"}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0A0A0F",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: "#8E8E93",
    fontSize: 14,
    marginBottom: 32,
    fontWeight: "400",
  },

  inputContainer: {
    backgroundColor: "#1C1C23",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2C2C35",
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  input: {
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 12,
    fontWeight: "400",
  },

  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    backgroundColor: "#14F195",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: "#0A0A0F",
    fontWeight: "600",
    fontSize: 15,
  },
  btnGhost: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2C2C35",
  },
  btnGhostText: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#1C1C23",
    borderRadius: 20,
    padding: 24,
    marginTop: 32,
    borderWidth: 1,
    borderColor: "#2C2C35",
  },
  label: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  balance: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -1,
  },
  sol: {
    color: "#14F195",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  addr: {
    color: "#A855F7",
    fontSize: 12,
    fontFamily: "monospace",
    marginTop: 20,
    alignSelf: "flex-start",
    backgroundColor: "#252530",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  section: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 40,
    marginBottom: 16,
    letterSpacing: -0.4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#16161D",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#26262F",
  },
  mint: {
    color: "#E5E7EB",
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "500",
  },
  amount: {
    color: "#14F195",
    fontSize: 14,
    fontWeight: "600",
  },
  time: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "400",
  },
  statusIcon: {
    fontSize: 16,
    fontWeight: "700",
  },
});
